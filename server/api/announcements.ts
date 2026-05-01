import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/db'
import { announcements, settings } from '../database/schema'
import { asc, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET: List all announcements
  if (method === 'GET') {
    return await db.query.announcements.findMany({
      orderBy: [asc(announcements.order)],
    })
  }

  // POST: Create new announcement
  if (method === 'POST') {
    const formData = await readMultipartFormData(event)
    if (!formData) throw createError({ statusCode: 400, statusMessage: 'Invalid form data' })

    const titleField = formData.find(f => f.name === 'title')
    const durationField = formData.find(f => f.name === 'duration')
    const mediaField = formData.find(f => f.name === 'media')

    if (!mediaField) throw createError({ statusCode: 400, statusMessage: 'Media file is required' })

    const title = titleField ? titleField.data.toString() : 'Sem título'
    
    // Get default duration from settings if not provided
    let duration = durationField ? Number(durationField.data.toString()) : null
    if (!duration) {
      const config = await db.query.settings.findFirst()
      duration = config?.defaultDuration || 10
    }
    
    // Save file
    const ext = path.extname(mediaField.filename || '') || (mediaField.type?.startsWith('video/') ? '.mp4' : '.jpg')
    const fileName = `${uuidv4()}${ext}`
    const isVideo = mediaField.type?.startsWith('video/')
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    fs.writeFileSync(path.join(uploadsDir, fileName), mediaField.data)

    // Get current max order
    const allAnnouncements = await db.select().from(announcements)
    const nextOrder = allAnnouncements.length

    const newAnnouncement = {
      id: uuidv4(),
      title,
      type: isVideo ? 'video' : 'image',
      mediaPath: `/uploads/${fileName}`,
      duration,
      active: true,
      order: nextOrder,
      createdAt: new Date().toISOString()
    }

    await db.insert(announcements).values(newAnnouncement)
    
    setResponseStatus(event, 201)
    return newAnnouncement
  }
})
