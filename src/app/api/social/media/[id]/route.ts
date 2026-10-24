import { assinaturaValida } from '@/lib/social/media';
import { lerArquivo } from '@/lib/social/repository';
import { uuid } from '@/lib/social/validation';
export const maxDuration = 300;
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params; uuid(id); const url = new URL(request.url);
    if (!assinaturaValida(id, url.searchParams.get('exp') || '', url.searchParams.get('sig') || '')) return new Response(null, { status: 404 });
    const arquivo = await lerArquivo(id); if (!arquivo?.url) return new Response(null, { status: 404 });
    const range = request.headers.get('range'); const headers: Record<string, string> = {};
    if (range && /^bytes=\d+-\d*$/.test(range)) headers.Range = range;
    const r = await fetch(arquivo.url, { headers, cache: 'no-store', signal: AbortSignal.timeout(240_000) });
    const saida = new Headers({ 'Content-Type': arquivo.mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    for (const key of ['content-length', 'content-range', 'accept-ranges']) { const v = r.headers.get(key); if (v) saida.set(key, v); }
    return new Response(r.body, { status: r.status, headers: saida });
  } catch { return new Response(null, { status: 404 }); }
}
