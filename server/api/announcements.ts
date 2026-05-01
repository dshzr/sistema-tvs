import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/db'
import { announcements, settings } from '../database/schema'
import { asc } from 'drizzle-orm'
import { uploadToCloudinary } from '../utils/cloudinary'

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
    
    let duration = durationField ? Number(durationField.data.toString()) : null
    if (!duration) {
      const config = await db.query.settings.findFirst()
      duration = config?.defaultDuration || 10
    }
    
    // Upload to Cloudinary
    try {
      const cloudinaryResult: any = await uploadToCloudinary({
        data: mediaField.data,
        filename: mediaField.filename || 'upload',
        type: mediaField.type || 'image/jpeg'
      })

      // Get current max order
      const allAnnouncements = await db.select().from(announcements)
      const nextOrder = allAnnouncements.length

      const newAnnouncement = {
        id: uuidv4(),
        title,
        type: cloudinaryResult.resource_type === 'video' ? 'video' : 'image',
        mediaPath: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        duration,
        active: true,
        order: nextOrder,
        createdAt: new Date().toISOString()
      }

      await db.insert(announcements).values(newAnnouncement)
      
      setResponseStatus(event, 201)
      return newAnnouncement
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to upload media to Cloudinary' })
    }
  }
})
