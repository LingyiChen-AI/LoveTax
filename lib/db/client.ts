import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __pg: ReturnType<typeof postgres> | undefined;
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');

const sql = global.__pg ?? postgres(url, { max: 10, prepare: false });
if (process.env.NODE_ENV !== 'production') global.__pg = sql;

export const db = drizzle(sql, { schema });
export type DB = typeof db;
