import { mysqlTable, text, timestamp, varchar, json, index, boolean } from 'drizzle-orm/mysql-core';
import type { Entity } from '@/lib/types';

export const users = mysqlTable('ghostroar_users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at', { fsp: 6 }).defaultNow().notNull(),
});
export const sessions = mysqlTable('ghostroar_sessions', {
  tokenHash: varchar('token_hash', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { fsp: 6 }).notNull(),
}, table => [index('session_user_idx').on(table.userId)]);
export const resources = mysqlTable('ghostroar_resources', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  data: json('data').$type<Partial<Entity>>().notNull(),
  createdAt: timestamp('created_at', { fsp: 6 }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { fsp: 6 }).defaultNow().notNull(),
}, table => [index('resource_owner_type_idx').on(table.userId, table.type)]);
