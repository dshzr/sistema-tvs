import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = await db.query.settings.findFirst()
  
  const adminPassword = config?.adminPassword || 'admin123'
  
  if (body.password === adminPassword) {
    return { success: true }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Senha incorreta'
    })
  }
})
