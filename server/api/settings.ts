import { db } from '../utils/db'
import { settings } from '../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    const config = await db.query.settings.findFirst()
    if (!config) {
      // Return default if not exists
      return { defaultDuration: 10, transition: 'fade' }
    }
    const { adminPassword, ...publicSettings } = config
    return publicSettings
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const config = await db.query.settings.findFirst()
    
    const updateData: any = {}
    if (body.defaultDuration !== undefined) updateData.defaultDuration = Number(body.defaultDuration)
    if (body.transition !== undefined) updateData.transition = body.transition
    if (body.adminPassword !== undefined && body.adminPassword.trim() !== '') {
      updateData.adminPassword = body.adminPassword.trim()
    }
    
    if (config) {
      await db.update(settings).set(updateData).where(eq(settings.id, config.id))
    } else {
      await db.insert(settings).values({ id: 1, ...updateData })
    }
    
    const updatedConfig = await db.query.settings.findFirst()
    const { adminPassword, ...publicSettings } = updatedConfig!
    return { success: true, settings: publicSettings }
  }
})
