import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'image' | 'video'
  mediaPath: text('media_path').notNull(),
  duration: integer('duration').notNull().default(10),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  order: integer('order').notNull().default(0),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  defaultDuration: integer('default_duration').notNull().default(10),
  transition: text('transition').notNull().default('fade'),
  adminPassword: text('admin_password').notNull().default('admin123'),
});
