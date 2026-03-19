import fs from 'fs'
import path from 'path'
import { DayBriefing } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'content/briefings')

export function getAllBriefings(): DayBriefing[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse()

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8')
    return JSON.parse(raw) as DayBriefing
  })
}

export function getBriefingByDate(date: string): DayBriefing | null {
  const filePath = path.join(CONTENT_DIR, `${date}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as DayBriefing
}

export function getAllDates(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
}

export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
}

export function getIssueNumber(dateStr: string): number {
  const start = new Date('2026-03-19')
  const [y, m, d] = dateStr.split('-').map(Number)
  const current = new Date(y, m - 1, d)
  const diff = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff + 1
}
