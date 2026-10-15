import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
let database: ReturnType<typeof drizzle> | undefined;
export function db() {
 if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL belum diatur.');
 return database ??= drizzle(postgres(process.env.DATABASE_URL,{prepare:false,max:5}));
}
