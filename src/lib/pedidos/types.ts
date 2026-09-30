import type { StatusEnvio } from '@/lib/admin/email';

export const TIPOS_DE_PROJETO = ['Site', 'Sistema ou plataforma', 'Aplicativo', 'E-commerce', 'Vídeo', 'Jogo', 'Identidade e produto digital', 'Ainda não sei'] as const;
export type TipoDeProjeto = (typeof TIPOS_DE_PROJETO)[number];

export type PedidoStatus = 'NOVO' | 'EM_CONVERSA' | 'PROPOSTA' | 'FECHADO' | 'PERDIDO';

export const PEDIDO_STATUS: PedidoStatus[] = ['NOVO', 'EM_CONVERSA', 'PROPOSTA', 'FECHADO', 'PERDIDO'];

export const PEDIDO_ROTULO: Record<PedidoStatus, string> = {
  NOVO: 'Novo',
  EM_CONVERSA: 'Em conversa',
  PROPOSTA: 'Contrato enviado',
  FECHADO: 'Fechado',
  PERDIDO: 'Perdido',
};

export type Pedido = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  ideia: string;
  status: PedidoStatus;
  notas: string;
  origem: string;
  emailStatus: StatusEnvio;
  criadoEm: string;
  atualizadoEm: string;
};

/** Serviço de contrato sugerido para cada tipo de pedido. */
export function servicoSugerido(tipo: string): 'site' | 'sistema' | 'video' | 'jogo' | 'projeto' {
  if (tipo === 'Site' || tipo === 'E-commerce') return 'site';
  if (tipo === 'Sistema ou plataforma' || tipo === 'Aplicativo') return 'sistema';
  if (tipo === 'Vídeo') return 'video';
  if (tipo === 'Jogo') return 'jogo';
  return 'projeto';
}
