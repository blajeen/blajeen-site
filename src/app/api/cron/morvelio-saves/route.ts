import { cronAutorizado } from '@/lib/analytics/cron';
import { MissingConfiguration } from '@/lib/analytics/providers';
import { syncUnity } from '@/lib/analytics/unity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
/** Lê os saves de produção do Morvelio (só leitura) e grava o snapshot agregado. Pode ser repetida: só relê o que mudou. */
export async function GET(request: Request) {
  if (!cronAutorizado(request)) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  try { return Response.json({ status: 'ok', ...(await syncUnity()) }); }
  catch (error) {
    return Response.json({ error: error instanceof MissingConfiguration ? error.message : 'Coleta dos saves não concluída. Confira a service account do Unity e o banco.' }, { status: 503 });
  }
}
