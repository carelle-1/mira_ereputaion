import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { resources } from '@/db/schema';
import { getUser, sameOrigin } from '@/lib/auth';
import { parseEntityData } from '@/lib/entity-data';
import { resourceTypes, type Entity, type ResourceType } from '@/lib/types';

export type ResourceContext = { params: Promise<{ type: string; id?: string }> };
const allowedFields = new Set(['name', 'description', 'status', 'platform', 'category', 'sentiment', 'score', 'count', 'growth', 'author', 'date', 'time', 'url', 'email', 'phone', 'role', 'company', 'country', 'city', 'languages', 'domain', 'severity', 'assignee', 'views', 'likes', 'comments', 'image', 'notes', 'progress', 'active', 'emailAlerts', 'pushAlerts', 'digest']);
export async function handleResource(request: Request, context: ResourceContext) {
  try {
    if (request.method !== 'GET' && !sameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 });
    const { type, id } = await context.params;
    if (!resourceTypes.includes(type as ResourceType)) return NextResponse.json({ error: 'Ressource inconnue.' }, { status: 404 });
    if (id && !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
    const condition = and(eq(resources.userId, user.id), eq(resources.type, type), id ? eq(resources.id, id) : undefined);
    if (request.method === 'GET') {
      const rows = await db.select().from(resources).where(condition).orderBy(asc(resources.createdAt));
      return NextResponse.json(rows.map(row => ({ ...parseEntityData(row.data), id: row.id, type: row.type })));
    }
    if (request.method === 'DELETE') {
      if (!id) return NextResponse.json({ error: 'Un identifiant est requis.' }, { status: 400 });
      const [result] = await db.delete(resources).where(condition);
      return result.affectedRows ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Élément introuvable.' }, { status: 404 });
    }
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    const data: Partial<Entity> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!allowedFields.has(key)) continue;
      if (typeof value === 'string') data[key] = value.trim().slice(0, key === 'description' || key === 'notes' ? 20000 : 1000);
      else if (typeof value === 'boolean') data[key] = value;
      else if (typeof value === 'number' && Number.isFinite(value)) data[key] = value;
    }
    if ((request.method === 'POST' || data.name !== undefined) && (!data.name || data.name.length < 2)) return NextResponse.json({ error: 'Le nom doit comporter au moins 2 caractères.' }, { status: 400 });
    if (data.url && !/^https?:\/\//i.test(data.url)) return NextResponse.json({ error: 'L’URL doit commencer par https:// ou http://.' }, { status: 400 });
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    if (data.score !== undefined && (data.score < 0 || data.score > 100)) return NextResponse.json({ error: 'Le score doit être compris entre 0 et 100.' }, { status: 400 });
    if (request.method === 'POST') {
      const id = randomUUID();
      await db.insert(resources).values({ id, userId: user.id, type, data: { status: 'active', date: new Date().toISOString(), ...data } });
      const [row] = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
      return NextResponse.json({ ...parseEntityData(row.data), id: row.id, type }, { status: 201 });
    }
    if (!id) return NextResponse.json({ error: 'Un identifiant est requis.' }, { status: 400 });
    const [existing] = await db.select().from(resources).where(condition).limit(1);
    if (!existing) return NextResponse.json({ error: 'Élément introuvable.' }, { status: 404 });
    const previous = parseEntityData(existing.data);
    await db.update(resources).set({ data: { ...previous, ...data }, updatedAt: new Date() }).where(condition);
    return NextResponse.json({ ...previous, ...data, id: existing.id, type });
  } catch (error) {
    console.error('Resource error', error);
    return NextResponse.json({ error: 'L’enregistrement a échoué. Réessayez.' }, { status: 500 });
  }
}
