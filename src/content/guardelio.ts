import { ROTAS } from '@/lib/routes';

/**
 * Auditado contra blajeen/guardelio (site público em apps/web) em 16/11/2026. O Guardelio tem
 * site, privacidade, termos e contato próprios em guardelio.com.br; aqui só apontamos para eles.
 * Preços ficam no site do produto, para não divergirem daqui.
 */
const siteGuardelio = 'https://www.guardelio.com.br';

export const guardelio = {
  nome: 'Guardelio',
  rota: ROTAS.produtoGuardelio,
  estado: 'PROTEÇÃO DE MÍDIA PAGA · DISPONÍVEL',
  lema: 'Proteção gerenciada para mídia paga.',
  resumo:
    'Saiba o que realmente acontece depois de cada clique pago. O Guardelio observa, investiga e organiza a proteção do seu tráfego, com economia validada e controle humano.',
  site: siteGuardelio,
  parceria: 'Produzido pela Blajeen Labs em parceria com João Arita.',
  icone: { src: '/produtos/guardelio/icon.png', alt: '', tamanho: 512 },
  documentos: [
    { href: `${siteGuardelio}/planos`, rotulo: 'Planos' },
    { href: `${siteGuardelio}/seguranca-e-privacidade`, rotulo: 'Segurança e privacidade' },
    { href: `${siteGuardelio}/privacidade`, rotulo: 'Política de privacidade' },
    { href: `${siteGuardelio}/termos`, rotulo: 'Termos de uso' },
    { href: `${siteGuardelio}/contato`, rotulo: 'Contato' },
  ],
  recursos: [
    { titulo: 'Um snippet leve', texto: 'Uma tag leve na landing page, sem quebrar nada e sem coletar texto digitado, senhas ou campos de formulário.' },
    { titulo: 'Evidência por sessão', texto: 'Sinais técnicos, contexto de campanha e comportamento viram um score explicável, com recorrência, campanha e evidências por sessão.' },
    { titulo: 'Você decide os bloqueios', texto: 'Nada é bloqueado sozinho: você decide no portal, e cada bloqueio fica registrado com quem decidiu, quando e por quanto tempo vale.' },
    { titulo: 'Economia revisada por pessoas', texto: 'Suspeita não é evidência, e evidência não é economia. Ações e economia são revisadas por pessoas antes do fechamento.' },
  ],
  planos:
    'Três planos: no Essencial você acompanha e decide; no Pro, um especialista manda todo mês um parecer com o que mudar; no Ultra, um consultor dedicado olha a empresa a fundo, com 20% sobre a economia validada.',
} as const;
