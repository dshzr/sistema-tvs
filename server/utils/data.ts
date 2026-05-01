import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'announcements.json')

export interface Announcement {
  id: string
  title: string
  type: 'image' | 'video'
  mediaPath: string
  duration: number
  active: boolean
  order: number
  createdAt: string
}

export interface Settings {
  defaultDuration: number
  transition: string
  adminPassword?: string
}

export interface DataStore {
  settings: Settings
  announcements: Announcement[]
}

const defaultData: DataStore = {
  settings: {
    defaultDuration: 10,
    transition: 'fade',
    adminPassword: 'admin'
  },
  announcements: []
}

export function readData(): DataStore {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    }
    if (!fs.existsSync(DATA_FILE)) {
      writeData(defaultData)
      return defaultData
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading data:', err)
    return defaultData
  }
}

export function writeData(data: DataStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing data:', err)
  }
}
