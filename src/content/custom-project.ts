import { ROTAS } from '@/lib/routes';

export const projetoPersonalizado = {
  eyebrow: 'ENGENHARIA DE SOFTWARE APLICADA',
  titulo: 'Crie seu projeto.',
  descricao:
    'Coloque seu projeto — ou até uma ideia ainda no começo — em prática com a engenharia de software aplicada da Blajeen Labs. Da criação da identidade ao desenvolvimento do site, aplicativo ou sistema, cuidamos de cada etapa para construir uma solução com a sua cara e as funcionalidades que você realmente precisa.',
  complemento:
    'Você não precisa chegar com tudo definido. Ajudamos a organizar a ideia, identificar oportunidades, sugerir funcionalidades e transformar sua necessidade em um produto digital completo.',
  entregas: [
    {
      titulo: 'Sites e experiências digitais',
      texto: 'Sites institucionais, landing pages, portais, lojas virtuais e experiências responsivas.',
    },
    {
      titulo: 'Aplicativos e plataformas',
      texto: 'Aplicativos, sistemas, painéis administrativos e áreas reservadas para sua operação.',
    },
    {
      titulo: 'Identidade e produto',
      texto: 'Nome, logo, direção visual, protótipo e interface conectados à personalidade da marca.',
    },
    {
      titulo: 'Evolução contínua',
      texto: 'Suporte pós-entrega, manutenção e atualizações para o produto acompanhar o negócio.',
    },
  ],
  etapas: [
    ['01', 'Diagnóstico', 'Entendemos a necessidade, as pessoas envolvidas e o contexto do negócio.'],
    ['02', 'Ideação', 'Organizamos a ideia e sugerimos caminhos, funcionalidades e prioridades.'],
    ['03', 'Identidade', 'Definimos a linguagem visual que dará personalidade ao produto.'],
    ['04', 'Protótipo', 'Transformamos decisões em uma experiência clara antes de construir.'],
    ['05', 'Desenvolvimento', 'Construímos a solução em etapas verificáveis e conectadas.'],
    ['06', 'Validação', 'Testamos os fluxos essenciais e refinamos o que precisa evoluir.'],
    ['07', 'Publicação', 'Preparamos o produto para chegar ao público com segurança.'],
    ['08', 'Evolução', 'Acompanhamos ajustes, manutenção e novas versões após a entrega.'],
  ],
  ctaPrimario: { rotulo: 'COMEÇAR MEU PROJETO', href: '#comecar' },
  ctaSecundario: {
    rotulo: 'CONVERSAR SOBRE MINHA IDEIA',
    href: `${ROTAS.contato}?produto=projeto-personalizado#interesse`,
  },
} as const;

