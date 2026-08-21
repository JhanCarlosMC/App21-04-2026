import fs from 'fs'
import path from 'path'

export interface Photo {
  file: string
  caption: string
  featured?: boolean
  poster?: string
}

export interface Month {
  slug: string
  title: string
  description: string
  timelineCaption?: string
  date?: string
  order: number
  photos: Photo[]
}

export interface Config {
  startDate: string
  heroTitle: string
  heroSubtitle: string
  messages: string[]
  recapPhotos: Array<{ month: string; file: string; caption: string; poster?: string }>
}

const contentDir = path.join(process.cwd(), 'content')
const mesesDir = path.join(contentDir, 'meses')

export function getConfig(): Config {
  const configPath = path.join(contentDir, 'config.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  return config
}

export function getAllMonths(): Month[] {
  const files = fs.readdirSync(mesesDir)
  const meses = files
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const filePath = path.join(mesesDir, f)
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      return content
    })
    .sort((a, b) => a.order - b.order)
  return meses
}

export function getMonthBySlug(slug: string): Month | null {
  const meses = getAllMonths()
  return meses.find(m => m.slug === slug) || null
}

export function getAllMonthSlugs(): string[] {
  const meses = getAllMonths()
  return meses.map(m => m.slug)
}
