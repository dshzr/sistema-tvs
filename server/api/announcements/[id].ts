import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../../utils/db'
import { announcements } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const id = event.context.params?.id as string
  
  const announcement = await db.query.announcements.findFirst({
    where: eq(announcements.id, id)
  })

  if (!announcement) {
    throw createError({ statusCode: 404, statusMessage: 'Anúncio não encontrado' })
  }

  // DELETE
  if (method === 'DELETE') {
    const filePath = path.join(process.cwd(), 'public', announcement.mediaPath)
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch (e) {}
    }

    await db.delete(announcements).where(eq(announcements.id, id))
    
    // Optional: Reorder remaining announcements? 
    // Usually handled by the UI or reorder endpoint, but let's maintain current order integrity
    const remaining = await db.query.announcements.findMany({
      orderBy: (ann, { asc }) => [asc(ann.order)]
    })
    
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].order !== i) {
        await db.update(announcements).set({ order: i }).where(eq(announcements.id, remaining[i].id))
      }
    }
    
    return { success: true }
  }

  // PUT (Update)
  if (method === 'PUT') {
    const formData = await readMultipartFormData(event)
    if (!formData) throw createError({ statusCode: 400, statusMessage: 'Invalid form data' })

    const titleField = formData.find(f => f.name === 'title')
    const durationField = formData.find(f => f.name === 'duration')
    const activeField = formData.find(f => f.name === 'active')
    const mediaField = formData.find(f => f.name === 'media')

    const updateData: any = {}
    if (titleField) updateData.title = titleField.data.toString()
    if (durationField) updateData.duration = Number(durationField.data.toString())
    if (activeField) updateData.active = activeField.data.toString() === 'true'

    if (mediaField) {
      // Delete old file
      const oldPath = path.join(process.cwd(), 'public', announcement.mediaPath)
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath) } catch (e) {}
      }

      // Save new file
      const ext = path.extname(mediaField.filename || '') || (mediaField.type?.startsWith('video/') ? '.mp4' : '.jpg')
      const fileName = `${uuidv4()}${ext}`
      const isVideo = mediaField.type?.startsWith('video/')
      
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
      
      fs.writeFileSync(path.join(uploadsDir, fileName), mediaField.data)

      updateData.type = isVideo ? 'video' : 'image'
      updateData.mediaPath = `/uploads/${fileName}`
    }

    await db.update(announcements).set(updateData).where(eq(announcements.id, id))
    
    const updated = await db.query.announcements.findFirst({
      where: eq(announcements.id, id)
    })
    return updated
  }
})
