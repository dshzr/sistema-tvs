import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as schema from '../server/database/schema';

const jsonPath = join(process.cwd(), 'data', 'announcements.json');
const dbPath = join(process.cwd(), 'sqlite.db');

async function migrate() {
  if (!existsSync(jsonPath)) {
    console.log('Arquivo JSON não encontrado. Pulando migração.');
    return;
  }

  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

  console.log('Iniciando migração de dados...');

  // Migrar Configurações
  if (data.settings) {
    console.log('Migrando configurações...');
    await db.insert(schema.settings).values({
      id: 1,
      defaultDuration: data.settings.defaultDuration || 10,
      transition: data.settings.transition || 'fade',
      adminPassword: data.settings.adminPassword || 'admin123',
    }).onConflictDoUpdate({
      target: schema.settings.id,
      set: {
        defaultDuration: data.settings.defaultDuration,
        transition: data.settings.transition,
        adminPassword: data.settings.adminPassword,
      }
    });
  }

  // Migrar Anúncios
  if (data.announcements && data.announcements.length > 0) {
    console.log(`Migrando ${data.announcements.length} anúncios...`);
    for (const ann of data.announcements) {
      await db.insert(schema.announcements).values({
        id: ann.id,
        title: ann.title,
        type: ann.type,
        mediaPath: ann.mediaPath,
        duration: ann.duration,
        active: ann.active,
        order: ann.order,
        createdAt: ann.createdAt,
      }).onConflictDoNothing();
    }
  }

  console.log('Migração concluída com sucesso!');
  sqlite.close();
}

migrate().catch(console.error);
