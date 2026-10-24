import { protegerSocial } from '@/lib/social/http';
import { contasPublicas } from '@/lib/social/oauth';
import { criarPublicacao, historico, lerArquivo } from '@/lib/social/repository';
import { uuid, validarPublicacao } from '@/lib/social/validation';
export async function POST(request: Request) {
  const bloqueio = await protegerSocial(request); if (bloqueio) return bloqueio;
  try {
    const input = await request.json() as Record<string, unknown>;
    const arquivo = await lerArquivo(uuid(input.arquivoId));
    if (!arquivo?.url) return Response.json({ error: 'Envie e confirme o arquivo antes de publicar.' }, { status: 400 });
    let parsed: ReturnType<typeof validarPublicacao>;
    try { parsed = validarPublicacao(input, arquivo.tipo, await contasPublicas()); }
    catch (e) { return Response.json({ error: e instanceof Error ? e.message : 'Confira a legenda e as contas selecionadas.' }, { status: 400 }); }
    await criarPublicacao(parsed.id, arquivo, parsed.legenda, parsed.destinos);
    const item = (await historico()).find((p) => p.id === parsed.id);
    return Response.json({ item }, { status: 201 });
  } catch { return Response.json({ error: 'Não foi possível registrar a publicação. Atualize o histórico antes de tentar novamente.' }, { status: 400 }); }
}
