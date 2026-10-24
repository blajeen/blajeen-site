import { protegerSocial } from '@/lib/social/http';
import { confirmarArquivo } from '@/lib/social/media';
import { uuid } from '@/lib/social/validation';
export const maxDuration = 60;
export async function POST(request: Request) {
  const bloqueio = await protegerSocial(request); if (bloqueio) return bloqueio;
  try { const input = await request.json() as { id: string }; const arquivo = await confirmarArquivo(uuid(input.id)); return Response.json({ arquivo }); }
  catch { return Response.json({ error: 'Não foi possível validar o arquivo. Use JPG/PNG de até 5 MB ou MP4 de até 500 MB.' }, { status: 400 }); }
}
