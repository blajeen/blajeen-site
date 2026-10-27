import { protegerSocial } from '@/lib/social/http';
import { contasPrivadas, atualizarEnvio, reservarEnvio } from '@/lib/social/repository';
import { publicarDireto, verificarEnvio } from '@/lib/social/publish';
import { uuid } from '@/lib/social/validation';
export const maxDuration = 300;
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const bloqueio = await protegerSocial(request); if (bloqueio) return bloqueio;
  let remotoId: string | null = null; let id: string | null = null; let reservado = false;
  let estadoAnterior: 'aceito' | 'acao' | null = null;
  try {
    id = uuid((await ctx.params).id);
    const verificar = new URL(request.url).searchParams.get('verificar') === '1';
    let dados;
    if (verificar) {
      dados = await reservarEnvio(id, 'aceito');
      if (dados) estadoAnterior = 'aceito';
      else { dados = await reservarEnvio(id, 'acao'); if (dados) estadoAnterior = 'acao'; }
    } else dados = await reservarEnvio(id, 'pendente');
    if (!dados) return Response.json({ ok: true }); // Já reservado/concluído: nunca reenviar.
    reservado = true; remotoId = dados.envio.remotoId;
    const conta = (await contasPrivadas()).find((c) => c.id === dados.envio.contaId);
    if (!conta) { await atualizarEnvio(id, { estado: 'falhou', remotoId, erro: 'A conta foi desconectada. Conecte novamente antes de criar outra publicação.' }); return Response.json({ ok: false }); }
    const resultado = verificar ? await verificarEnvio(conta, dados.envio) : await publicarDireto(conta, dados.arquivo, dados.post.legenda, async (remoto) => {
      remotoId = remoto;
      await atualizarEnvio(id!, { estado: 'enviando', remotoId, erro: null });
    });
    await atualizarEnvio(id, resultado || { estado: 'aceito', remotoId, erro: dados.envio.erro });
    return Response.json({ ok: true });
  } catch {
    if (reservado && id) await atualizarEnvio(id, { estado: estadoAnterior || 'incerto', remotoId, erro: estadoAnterior ? 'Não foi possível consultar a rede. Tente atualizar os resultados novamente.' : 'O envio não foi confirmado. Confira esta rede e suas permissões antes de criar outra publicação.' }).catch(() => undefined);
    return Response.json({ error: 'Não foi possível confirmar o envio. Consulte o resultado no histórico.' }, { status: 502 });
  }
}

