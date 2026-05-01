import { db } from '../../utils/db'
import { announcements } from '../../database/schema'
import { eq, asc } from 'drizzle-orm'
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary'

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
    // Delete from Cloudinary if exists
    if (announcement.publicId) {
      try { await deleteFromCloudinary(announcement.publicId) } catch (e) { console.error('Delete error:', e) }
    }

    await db.delete(announcements).where(eq(announcements.id, id))
    
    // Reorder remaining announcements
    const remaining = await db.query.announcements.findMany({
      orderBy: [asc(announcements.order)]
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

    if (mediaField && mediaField.data.length > 0) {
      // Delete old file from Cloudinary
      if (announcement.publicId) {
        try { await deleteFromCloudinary(announcement.publicId) } catch (e) {}
      }

      // Upload new file
      const cloudinaryResult: any = await uploadToCloudinary({
        data: mediaField.data,
        filename: mediaField.filename || 'upload',
        type: mediaField.type || 'image/jpeg'
      })

      updateData.type = cloudinaryResult.resource_type === 'video' ? 'video' : 'image'
      updateData.mediaPath = cloudinaryResult.secure_url
      updateData.publicId = cloudinaryResult.public_id
    }

    await db.update(announcements).set(updateData).where(eq(announcements.id, id))
    
    const updated = await db.query.announcements.findFirst({
      where: eq(announcements.id, id)
    })
    return updated
  }
})
