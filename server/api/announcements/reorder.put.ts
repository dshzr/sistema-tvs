import { db } from '../../utils/db'
import { announcements } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!Array.isArray(body.orderedIds)) {
    throw createError({ statusCode: 400, statusMessage: 'orderedIds deve ser um array' })
  }

  // Update order for each ID
  for (let index = 0; index < body.orderedIds.length; index++) {
    const id = body.orderedIds[index]
    await db.update(announcements)
      .set({ order: index })
      .where(eq(announcements.id, id))
  }

  return { success: true }
})
