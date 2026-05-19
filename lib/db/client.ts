import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DB = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __pg: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __db: DB | undefined;
}

function createClient(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = global.__pg ?? postgres(url, { max: 10, prepare: false });
  if (process.env.NODE_ENV !== 'production') global.__pg = sql;
  return drizzle(sql, { schema });
}

/**
 * Lazy Drizzle client.
 *
 * The underlying connection isn't created until the first time someone
 * actually touches the client (e.g. `db.select(...)` or `db.query.users`).
 * This keeps `next build` happy on machines without `DATABASE_URL` —
 * pages that use the DB are all dynamic and won't execute at build time,
 * so the env check fires only at request time.
 */
export const db: DB = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    if (!global.__db) global.__db = createClient();
    return Reflect.get(global.__db as object, prop, receiver);
  }
});
