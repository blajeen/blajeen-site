import { protegerSocial } from '@/lib/social/http';
import { removerConta } from '@/lib/social/repository';
export async function DELETE(request: Request) {
  const bloqueio = await protegerSocial(request); if (bloqueio) return bloqueio;
  const input = await request.json() as { id?: unknown };
  if (typeof input.id !== 'string' || input.id.length > 200) return Response.json({ error: 'Conta inválida.' }, { status: 400 });
  await removerConta(input.id); return Response.json({ ok: true });
}
