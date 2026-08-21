import type { ProjectId } from './types';
import { ROTAS } from '@/lib/routes';

/**
 * Novidades do laboratório.
 *
 * Cada item tem data de publicação, e a página só mostra o que já chegou. Isso permite deixar um
 * anúncio pronto sem que o site o afirme antes da hora — foi por isso que o lançamento do Revalio
 * pôde ser escrito com antecedência sem virar promessa publicada.
 *
 * Regra de conteúdo: nada aqui pode citar número, prazo, plataforma ou recurso que não exista.
 */
export type Novidade = {
  readonly id: string;
  /** Data de publicação, em ISO. Itens no futuro ficam ocultos até chegarem. */
  readonly data: string;
  readonly titulo: string;
  readonly texto: readonly string[];
  readonly projeto?: ProjectId;
  /** Destino editorial para novidades que não pertencem aos três jogos. */
  readonly href?: string;
  readonly cta?: string;
  readonly rotulo: string;
};

export const novidades: readonly Novidade[] = [
  {
    id: 'clinica-medica-em-desenvolvimento',
    data: '2026-08-21',
    rotulo: 'Em desenvolvimento',
    titulo: 'Clínica Médica entra na bancada da Blajeen Labs',
    texto: [
      'A nova direção de produto é pensada principalmente para médicos que atendem de forma independente e precisam unir presença profissional, agendamento, agenda e organização dos pacientes.',
      'Prontuário, histórico clínico e modelos para receitas, encaminhamentos, atestados e solicitações de exames fazem parte do escopo inicial. O produto ainda não possui demonstração pública, integrações ou data de lançamento anunciada.',
    ],
    href: ROTAS.clinicaMedica,
    cta: 'Conhecer a Clínica Médica',
  },
  {
    id: 'studio-beauty-em-demonstracao',
    data: '2026-08-21',
    rotulo: 'Demonstração disponível',
    titulo: 'Studio Beauty reúne atendimento, agenda e gestão',
    texto: [
      'A plataforma para estúdios de beleza já pode ser explorada. A experiência pública reúne serviços, profissionais, portfólio, pacotes e um agendamento capaz de combinar atendimentos e organizar eventos.',
      'Cliente, profissional e gestão possuem áreas próprias. Marca, conteúdo, módulos, serviços, equipe e regras de agenda são adaptados à identidade e à rotina de cada operação.',
    ],
    href: ROTAS.salaoEstetica,
    cta: 'Explorar o Studio Beauty',
  },
  {
    id: 'ecommerce-em-demonstracao',
    data: '2026-08-21',
    rotulo: 'Demonstração disponível',
    titulo: 'O e-commerce white-label já pode ser explorado',
    texto: [
      'A nova demonstração reúne vitrine, categorias, busca com sugestões, páginas de produto, carrinho e um checkout assistido que leva o pedido ao atendimento pelo WhatsApp.',
      'A operação também possui um painel para produtos, ofertas, estoque, categorias, catálogo em PDF e dados públicos da loja. Marca, catálogo, conteúdo e jornada de fechamento são adaptados a cada contratante.',
    ],
    href: ROTAS.ecommerce,
    cta: 'Explorar o e-commerce',
  },
  {
    id: 'barbearia-em-demonstracao',
    data: '2026-08-20',
    rotulo: 'Demonstração disponível',
    titulo: 'A plataforma para barbearias já pode ser explorada',
    texto: [
      'A nova linha de produtos da Blajeen Labs começa com uma plataforma web para barbearias. Ela reúne site institucional, agendamento online sem criação de conta e uma área de gestão para acompanhar equipe, agenda e operação.',
      'A demonstração apresenta a base funcionando por dentro. Em cada implantação, identidade, conteúdo, serviços, horários e regras são adaptados às necessidades da barbearia.',
    ],
    href: ROTAS.barbearia,
    cta: 'Conhecer a plataforma',
  },
  {
    id: 'personal-studio-em-demonstracao',
    data: '2026-08-20',
    rotulo: 'Demonstração disponível',
    titulo: 'Personal conecta aluno, profissional e gestão',
    texto: [
      'O Personal ganhou uma página completa e uma demonstração navegável. A plataforma reúne agenda, treinos, evolução e gestão em experiências próprias para aluno, profissional e gestor.',
      'O produto parte de uma base funcional e é adaptado às necessidades, à identidade e às regras de personal trainers e estúdios de treinamento.',
    ],
    href: ROTAS.personalStudio,
    cta: 'Explorar o Personal',
  },
  {
    id: 'gramelio-entra-no-laboratorio',
    data: '2026-08-19',
    rotulo: 'Novo experimento',
    projeto: 'gramelio',
    titulo: 'Gramelio entra no laboratório',
    texto: [
      'O terceiro experimento da Blajeen Labs é um jogo casual de fazenda, e o primeiro do laboratório que não fala de medicina. Um toque na tela move o animal; na campanha da vaca, o jogo é comer a grama certa, administrar o estômago e voltar ao curral para produzir leite.',
      'Por enquanto existe o desenho: o ciclo da partida, os mapas pequenos, os mundos, as missões e a customização. Ainda não há build público, plataforma ou data anunciada — quando houver, aparece aqui primeiro.',
    ],
  },
  {
    id: 'revalio-nas-lojas',
    data: '2026-08-25',
    rotulo: 'Lançamento',
    projeto: 'revalio',
    titulo: 'O Revalio chegou à App Store e ao Google Play',
    texto: [
      'O primeiro aplicativo da Blajeen Labs saiu do laboratório. O Revalio é microaprendizagem para quem estuda para o Revalida e para a residência: trilhas, atividades curtas, revisão dos erros e um progresso que dá para enxergar.',
      'A ideia por trás dele é simples de dizer e difícil de fazer — constância exige ritmo. O app foi construído para que estudar caiba no dia, e não o contrário.',
      'Conteúdo educacional. Não substitui formação, protocolos ou decisão clínica.',
    ],
  },
  {
    id: 'docalio-em-desenvolvimento',
    data: '2026-08-18',
    rotulo: 'Em desenvolvimento',
    projeto: 'docalio',
    titulo: 'Docalio está em desenvolvimento',
    texto: [
      'O segundo projeto do laboratório é um jogo de estratégia por níveis. Cada plantão traz pacientes que precisam ser salvos a tempo, e o segredo não é a rapidez: é saber priorizar na hora da emergência.',
      'Ainda não há build público, data ou plataforma anunciada. Quando houver, aparece aqui primeiro.',
      'Casos e personagens são ficcionais. O jogo não oferece diagnóstico nem orientação para pacientes reais.',
    ],
  },
];

export const paginaDeNovidades = {
  eyebrow: 'REGISTRO DO LABORATÓRIO',
  titulo: 'Novidades',
  introducao:
    'O que saiu do laboratório e o que ainda está na bancada. Sem anúncio de recurso que não existe e sem data que não foi confirmada.',
  vazio: 'Ainda não há novidades publicadas.',
  metaTitulo: 'Novidades — Blajeen Labs',
  metaDescricao:
    'Lançamentos e andamento dos jogos e produtos digitais da Blajeen Labs.',
} as const;

/**
 * As novidades já publicadas, da mais recente para a mais antiga.
 *
 * A comparação usa o dia corrente: um item marcado para amanhã não aparece hoje.
 */
export function novidadesPublicadas(agora: Date = new Date()): readonly Novidade[] {
  const hoje = agora.toISOString().slice(0, 10);
  return [...novidades]
    .filter((item) => item.data <= hoje)
    .sort((a, b) => b.data.localeCompare(a.data));
}

/** Formata a data para leitura, em português. */
export function dataPorExtenso(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return `${dia} de ${meses[(mes ?? 1) - 1]} de ${ano}`;
}
