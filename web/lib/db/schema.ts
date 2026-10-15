import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import type { State } from '../model';
export const workspaces = pgTable('workspaces', {
 id:text('id').primaryKey(), googleSubject:text('google_subject').notNull().unique(),
 email:text('email').notNull(), state:jsonb('state').$type<State>().notNull(),
 createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),
});
