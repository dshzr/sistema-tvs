import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { settings } from '../server/database/schema'

async function seed() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
  const db = drizzle(client)

  console.log('🌱 Seeding database...')

  // Check if settings already exist
  const existingSettings = await db.select().from(settings)
  
  if (existingSettings.length === 0) {
    await db.insert(settings).values({
      defaultDuration: 10,
      transition: 'fade',
      adminPassword: 'admin' // Default password
    })
    console.log('✅ Default settings created!')
  } else {
    console.log('ℹ️ Settings already exist, skipping.')
  }

  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
