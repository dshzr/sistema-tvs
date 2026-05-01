import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../database/schema';

const config = process.env;

const client = createClient({
  url: config.TURSO_DATABASE_URL || '',
  authToken: config.TURSO_AUTH_TOKEN || '',
});

export const db = drizzle(client, { schema });
