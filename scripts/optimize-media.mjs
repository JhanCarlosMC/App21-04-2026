#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const projectRoot = process.cwd()
const mediaRoot = path.join(projectRoot, 'public', 'meses')
const contentRoot = path.join(projectRoot, 'content')
const backupRoot = path.join(projectRoot, 'media-originals')
const applyChanges = process.argv.includes('--apply')

const imageExtensions = new Set(['.jpg', '.jpeg', '.png'])
const videoExtensions = new Set(['.mov', '.mp4'])

const imageOptions = {
  maxDimension: 2560,
  quality: 80,
}

const videoOptions = {
  maxDimension: 1920,
  maxFps: 30,
  crf: 23,
  audioBitrate: '128k',
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`
}

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(entryPath))
    if (entry.isFile()) files.push(entryPath)
  }

  return files
}

function mediaPlan(source) {
  const relativePath = path.relative(mediaRoot, source)
  const directory = path.dirname(relativePath)
  const extension = path.extname(source).toLowerCase()
  const stem = path.basename(source, path.extname(source))

  if (imageExtensions.has(extension)) {
    return {
      kind: 'image',
      source,
      relativePath,
      targetRelativePath: path.join(directory, `${stem}.webp`),
    }
  }

  if (videoExtensions.has(extension) && !stem.endsWith('.web')) {
    return {
      kind: 'video',
      source,
      relativePath,
      targetRelativePath: path.join(directory, `${stem}.web.mp4`),
      posterRelativePath: path.join(directory, `${stem}.poster.webp`),
    }
  }

  return null
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} terminó con código ${code}`))
    })
  })
}

async function optimizeImage(source, target) {
  await sharp(source, { failOn: 'warning' })
    .rotate()
    .resize({
      width: imageOptions.maxDimension,
      height: imageOptions.maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: imageOptions.quality, effort: 5, smartSubsample: true })
    .toFile(target)
}

async function optimizeVideo(source, target, poster) {
  const scaleFilter = [
    `scale='min(${videoOptions.maxDimension},iw)'` +
      `:'min(${videoOptions.maxDimension},ih)'`,
    'force_original_aspect_ratio=decrease',
    'force_divisible_by=2',
  ].join(':')

  await run('ffmpeg', [
    '-hide_banner',
    '-loglevel', 'error',
    '-y',
    '-i', source,
    '-map', '0:v:0',
    '-map', '0:a?',
    '-vf', scaleFilter,
    '-fpsmax', String(videoOptions.maxFps),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', String(videoOptions.crf),
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', videoOptions.audioBitrate,
    '-movflags', '+faststart',
    target,
  ])

  const posterPng = `${poster}.png`
  await run('ffmpeg', [
    '-hide_banner',
    '-loglevel', 'error',
    '-y',
    '-ss', '0.1',
    '-i', target,
    '-frames:v', '1',
    '-vf', 'scale=960:960:force_original_aspect_ratio=decrease:force_divisible_by=2',
    posterPng,
  ])

  await sharp(posterPng)
    .webp({ quality: 76, effort: 5 })
    .toFile(poster)
  await rm(posterPng)
}

async function jsonFiles() {
  const monthFiles = (await readdir(path.join(contentRoot, 'meses')))
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(contentRoot, 'meses', file))

  return [path.join(contentRoot, 'config.json'), ...monthFiles]
}

function updateMediaReferences(value, defaultMonth, mappings) {
  if (Array.isArray(value)) {
    for (const item of value) updateMediaReferences(item, defaultMonth, mappings)
    return
  }

  if (!value || typeof value !== 'object') return

  if (typeof value.file === 'string') {
    const month = typeof value.month === 'string' ? value.month : defaultMonth
    const mapping = mappings.get(`${month}/${value.file}`)

    if (mapping) {
      value.file = path.basename(mapping.targetRelativePath)
      if (mapping.posterRelativePath) {
        value.poster = path.basename(mapping.posterRelativePath)
      }
    }
  }

  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') {
      updateMediaReferences(child, defaultMonth, mappings)
    }
  }
}

async function updateContentFiles(plans) {
  const mappings = new Map(
    plans.map((plan) => [plan.relativePath, plan]),
  )

  for (const filePath of await jsonFiles()) {
    const document = JSON.parse(await readFile(filePath, 'utf8'))
    const defaultMonth = typeof document.slug === 'string' ? document.slug : undefined
    updateMediaReferences(document, defaultMonth, mappings)
    await writeFile(filePath, `${JSON.stringify(document, null, 2)}\n`)
  }
}

async function main() {
  const allFiles = await walk(mediaRoot)
  const plans = allFiles.map(mediaPlan).filter(Boolean)

  if (plans.length === 0) {
    console.log('No hay medios nuevos pendientes de optimización.')
    return
  }

  const images = plans.filter((plan) => plan.kind === 'image')
  const videos = plans.filter((plan) => plan.kind === 'video')
  let originalBytes = 0

  for (const plan of plans) {
    originalBytes += (await stat(plan.source)).size
  }

  console.log(`Imágenes pendientes: ${images.length}`)
  console.log(`Videos pendientes: ${videos.length}`)
  console.log(`Peso original: ${formatBytes(originalBytes)}`)
  console.log(`Fotos: WebP, máximo ${imageOptions.maxDimension}px, calidad ${imageOptions.quality}`)
  console.log(`Videos: MP4 H.264, máximo ${videoOptions.maxDimension}px, ${videoOptions.maxFps} FPS, CRF ${videoOptions.crf}`)

  if (!applyChanges) {
    console.log('\nAuditoría terminada. Ejecuta `npm run media:optimize` para aplicar los cambios.')
    return
  }

  if (videos.length > 0 && spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) {
    throw new Error('FFmpeg no está instalado. En macOS: brew install ffmpeg')
  }

  const targets = new Set()
  for (const plan of plans) {
    for (const relativeTarget of [plan.targetRelativePath, plan.posterRelativePath].filter(Boolean)) {
      if (targets.has(relativeTarget)) throw new Error(`Destino duplicado: ${relativeTarget}`)
      targets.add(relativeTarget)

      const publicTarget = path.join(mediaRoot, relativeTarget)
      if (await exists(publicTarget)) throw new Error(`El destino ya existe: ${publicTarget}`)
    }

    const backup = path.join(backupRoot, plan.relativePath)
    if (await exists(backup)) throw new Error(`El respaldo ya existe: ${backup}`)
  }

  const stagingRoot = await mkdtemp(path.join(os.tmpdir(), 'app-media-'))

  try {
    for (const [index, plan] of plans.entries()) {
      console.log(`[${index + 1}/${plans.length}] ${plan.relativePath}`)
      const stagedTarget = path.join(stagingRoot, plan.targetRelativePath)
      await mkdir(path.dirname(stagedTarget), { recursive: true })

      if (plan.kind === 'image') {
        await optimizeImage(plan.source, stagedTarget)
      } else {
        const stagedPoster = path.join(stagingRoot, plan.posterRelativePath)
        await optimizeVideo(plan.source, stagedTarget, stagedPoster)
      }
    }

    let optimizedBytes = 0
    for (const plan of plans) {
      const stagedFiles = [plan.targetRelativePath, plan.posterRelativePath].filter(Boolean)
      for (const relativeTarget of stagedFiles) {
        const stagedTarget = path.join(stagingRoot, relativeTarget)
        const publicTarget = path.join(mediaRoot, relativeTarget)
        const targetStat = await stat(stagedTarget)
        if (targetStat.size === 0) throw new Error(`El archivo generado está vacío: ${relativeTarget}`)
        optimizedBytes += targetStat.size
        await mkdir(path.dirname(publicTarget), { recursive: true })
        await copyFile(stagedTarget, publicTarget)
      }
    }

    await updateContentFiles(plans)

    for (const plan of plans) {
      const backup = path.join(backupRoot, plan.relativePath)
      await mkdir(path.dirname(backup), { recursive: true })
      await rename(plan.source, backup)
    }

    const reduction = (1 - optimizedBytes / originalBytes) * 100
    console.log('\nOptimización completada.')
    console.log(`Resultado: ${formatBytes(optimizedBytes)} (${reduction.toFixed(1)}% menos)`)
    console.log(`Originales recuperables en: ${backupRoot}`)
  } finally {
    await rm(stagingRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`)
  process.exitCode = 1
})
