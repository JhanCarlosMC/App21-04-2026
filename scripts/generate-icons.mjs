import { mkdir, copyFile } from 'node:fs/promises'
import sharp from 'sharp'

// Keep every mobile icon in sync with the editable SVG source.
const source = new URL('../app/icon.svg', import.meta.url)
const publicDir = new URL('../public/', import.meta.url)
await mkdir(new URL('icons/', publicDir), { recursive: true })

await Promise.all([
  [180, new URL('../app/apple-icon.png', import.meta.url)],
  [192, new URL('icons/album-192.png', publicDir)],
  [512, new URL('icons/album-512.png', publicDir)],
].map(([size, output]) => sharp(source.pathname, { density: 192 })
  .resize(size, size)
  .removeAlpha()
  .png()
  .toFile(output.pathname)))

// Also support browsers that request Apple's conventional URL directly.
await copyFile(new URL('../app/apple-icon.png', import.meta.url), new URL('apple-touch-icon.png', publicDir))
console.log('Generated opaque Apple (180px) and Android (192px, 512px) icons.')
