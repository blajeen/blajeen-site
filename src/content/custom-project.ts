import type { ServicoId } from '@/content/contratos/tipos';
import type { TipoDeProjeto } from '@/lib/pedidos/types';

/**
 * "Crie seu projeto": direto ao ponto. Os valores vêm do catálogo vigente (painel → Catálogo),
 * o mesmo que gera o PDF para baixar; aqui fica só o texto em volta deles.
 */
export const projetoPersonalizado = {
  eyebrow: 'CRIE SEU PROJETO',
  titulo: 'Valores e orçamento.',
  descricao:
    'Sites, sistemas, vídeos, jogos e projetos sob medida. Veja o valor de cada plano, baixe o catálogo completo e peça seu orçamento: a proposta chega por escrito em até 2 dias úteis.',
  contratar: [
    ['01', 'Conversa', 'Você conta o que precisa pelo formulário, WhatsApp ou e-mail.'],
    ['02', 'Proposta', 'Escopo, prazo e valor por escrito em até 2 dias úteis.'],
    ['03', 'Contrato digital', 'Você confere e assina pelo celular.'],
    ['04', 'Pagamento', '50% na assinatura e 50% na entrega, por Pix, boleto ou cartão.'],
  ],
  garantias: ['7 dias de garantia de satisfação', '30 dias de garantia técnica', 'Código e arquivos seus após a quitação'],
} as const;

/** O tipo que o formulário já traz marcado quando a pessoa escolhe um plano. */
export function tipoDoPlano(servico: ServicoId, plano: string): TipoDeProjeto {
  if (servico === 'site') return plano === 'loja' ? 'E-commerce' : 'Site';
  if (servico === 'sistema') return plano === 'app' ? 'Aplicativo' : 'Sistema ou plataforma';
  if (servico === 'video') return 'Vídeo';
  if (servico === 'jogo') return 'Jogo';
  return plano === 'id' ? 'Identidade e produto digital' : 'Ainda não sei';
}
