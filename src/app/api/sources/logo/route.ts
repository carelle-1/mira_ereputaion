import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { resources } from '@/db/schema';
import { getUser, sameOrigin } from '@/lib/auth';
import { parseEntityData } from '@/lib/entity-data';
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return Response.json({ error: 'Origine non autorisée.' }, { status: 403 });
    const user = await getUser();
    if (!user) return Response.json({ error: 'Veuillez vous connecter.' }, { status: 401 });
    const form = await request.formData();
    const file = form.get('logo');
    const sourceId = form.get('sourceId');
    if (!(file instanceof File) || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) return Response.json({ error: 'Choisissez une image JPG, PNG ou WebP de moins de 2 Mo.' }, { status: 400 });
    if (!sourceId || typeof sourceId !== 'string') return Response.json({ error: 'Identifiant de source requis.' }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const valid = file.type === 'image/jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 : file.type === 'image/png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
    if (!valid) return Response.json({ error: 'Le fichier n\'est pas une image valide.' }, { status: 400 });
    const condition = and(eq(resources.userId, user.id), eq(resources.type, 'sources'), eq(resources.id, sourceId));
    const [source] = await db.select().from(resources).where(condition).limit(1);
    if (!source) return Response.json({ error: 'Source introuvable.' }, { status: 404 });
    const previous = parseEntityData(source.data);
    await db.update(resources).set({ data: { ...previous, image: `data:${file.type};base64,${bytes.toString('base64')}` }, updatedAt: new Date() }).where(eq(resources.id, source.id));
    return Response.json({ success: true, image: `data:${file.type};base64,${bytes.toString('base64')}` });
  } catch { return Response.json({ error: 'L\'enregistrement du logo a échoué.' }, { status: 500 }); }
}