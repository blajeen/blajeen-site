import { AdminShell } from '@/components/admin/AdminShell';
import { AdminRedesSociais } from '@/components/admin/AdminRedesSociais';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
import { carregarPainelSocial } from '@/lib/social/dashboard';
import type { PainelSocial } from '@/lib/social/types';
export const dynamic = 'force-dynamic';
export default async function RedesSociaisPage({ searchParams }: { searchParams: Promise<{ conexao?: string }> }) {
  await exigirSessaoAdmin();
  let inicial: PainelSocial | null = null; let erroInicial = '';
  try { inicial = await carregarPainelSocial(); } catch { erroInicial = 'Não foi possível carregar as redes. Confira a conexão com o banco e a migration do módulo.'; }
  return <AdminShell titulo="Redes sociais." descricao="Uma imagem ou um vídeo. Uma legenda. Suas redes no mesmo lugar."><AdminRedesSociais inicial={inicial} erroInicial={erroInicial} conexao={(await searchParams).conexao || ''} /></AdminShell>;
}
