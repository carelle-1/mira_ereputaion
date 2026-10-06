import { randomBytes, randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { resources, users } from '@/db/schema';
import { demoData } from './demo-data';
import { hashPassword } from './auth';
import { parseEntityData } from './entity-data';
import { resourceTypes, type Entity, type ResourceType, type WorkspaceData } from './types';

let seedPromise: Promise<typeof users.$inferSelect> | undefined;
export async function seedWorkspace(userId: string) {
  const rows = resourceTypes.flatMap(type => demoData[type].map(entity => {
    const { id: _id, type: _type, ...data } = entity;
    return { id: randomUUID(), userId, type, data };
  }));
  await db.insert(resources).values(rows);
}
export async function ensureDemoUser() {
  if (!seedPromise) seedPromise = (async () => {
    const email = 'demo@ghostroar.app';
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) return existing;
    const id = randomUUID();
    const record = { id, name: 'Arnaud Kenne', email, passwordHash: hashPassword(randomBytes(40).toString('hex')), isDemo: true, createdAt: new Date() };
    try {
      await db.insert(users).values(record);
      await seedWorkspace(id);
      return record;
    } catch (error: any) {
      if (error?.code !== 'ER_DUP_ENTRY') throw error;
    }
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new Error('Impossible de créer le compte de démonstration.');
    return user;
  })().catch(error => { seedPromise = undefined; throw error; });
  return seedPromise;
}
export async function loadWorkspace(userId: string): Promise<WorkspaceData> {
  const data = Object.fromEntries(resourceTypes.map(type => [type, []])) as unknown as WorkspaceData;
  const rows = await db.select().from(resources).where(eq(resources.userId, userId)).orderBy(asc(resources.createdAt));
  rows.forEach(row => {
    const type = row.type as ResourceType;
    if (data[type]) data[type].push({ ...parseEntityData(row.data), id: row.id, type, name: parseEntityData<{ name?: string }>(row.data).name || '' } as Entity);
  });
  return data;
}
