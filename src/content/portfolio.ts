import { ROTAS } from '@/lib/routes';

export type TrabalhoId = 'dom-guima' | 'lina-art-pet';

export type Trabalho = {
  readonly id: TrabalhoId;
  readonly cliente: string;
  readonly categoria: string;
  readonly resumo: string;
  readonly desafio: string;
  readonly solucao: string;
  readonly contribuicoes: readonly string[];
  readonly capa: string;
  readonly capaAlt: string;
  readonly href: string;
  readonly site: string;
  readonly siteRotulo: string;
  readonly imagens: readonly { src: string; alt: string }[];
};

export const trabalhos: readonly Trabalho[] = [
  {
    id: 'dom-guima',
    cliente: 'Dom Guima',
    categoria: 'E-COMMERCE / OPERAÇÃO DIGITAL',
    resumo:
      'Loja virtual para uma operação multimarcas de Uberlândia, com catálogo próprio, busca, carrinho e atendimento comercial conectado à rotina real do negócio.',
    desafio:
      'Reunir um catálogo diverso em uma experiência clara, rápida de consultar e simples de manter pela própria operação.',
    solucao:
      'Criamos um e-commerce responsivo com categorias, busca, páginas de produto, carrinho, checkout assistido pelo WhatsApp e um painel privado para organizar catálogo, estoque, ofertas e configurações.',
    contribuicoes: [
      'Arquitetura e experiência da loja',
      'Catálogo, busca e páginas de produto',
      'Carrinho e venda assistida pelo WhatsApp',
      'Painel administrativo e catálogo em PDF',
      'SEO e dados estruturados',
      'Consulta de CEP com serviços reais',
    ],
    capa: '/trabalhos/dom-guima/capa.png',
    capaAlt: 'Identidade visual da loja Dom Guima, Empório das Ofertas.',
    href: ROTAS.trabalhoDomGuima,
    site: 'https://www.domguima.com.br',
    siteRotulo: 'VISITAR DOM GUIMA',
    imagens: [
      {
        src: '/trabalhos/dom-guima/catalogo-air-fryer.webp',
        alt: 'Imagem de produto usada no catálogo digital da Dom Guima.',
      },
      {
        src: '/trabalhos/dom-guima/catalogo-fechadura.webp',
        alt: 'Fechadura digital apresentada no catálogo da Dom Guima.',
      },
      {
        src: '/trabalhos/dom-guima/catalogo-climatizacao.webp',
        alt: 'Produto de climatização apresentado no catálogo da Dom Guima.',
      },
    ],
  },
  {
    id: 'lina-art-pet',
    cliente: 'Lina Art Pet',
    categoria: 'MARCA / SITE / PERSONALIZAÇÃO',
    resumo:
      'Experiência digital para um ateliê de Uberlândia que transforma fotos de pets em miniaturas 3D personalizadas.',
    desafio:
      'Traduzir um produto artesanal e afetivo para o digital sem perder a delicadeza da marca nem deixar o processo de personalização confuso.',
    solucao:
      'Construímos uma narrativa visual responsiva, catálogo, galeria real, visualização 3D e um configurador em etapas que organiza o pedido antes do atendimento pelo WhatsApp.',
    contribuicoes: [
      'Narrativa e arquitetura do site',
      'Jornada de personalização em nove etapas',
      'Visualização 3D do produto',
      'Catálogo e carrinho',
      'Galeria e comparativos com trabalhos reais',
      'Fluxo de orçamento pelo WhatsApp',
    ],
    capa: '/trabalhos/lina-art-pet/hero-ambiente.webp',
    capaAlt: 'Miniatura 3D personalizada de um cachorro criada pela Lina Art Pet.',
    href: ROTAS.trabalhoLinaArtPet,
    site: 'https://linaartpet.com.br',
    siteRotulo: 'VISITAR LINA ART PET',
    imagens: [
      {
        src: '/trabalhos/lina-art-pet/gato-foto.webp',
        alt: 'Fotografia de referência de um gato enviada para personalização.',
      },
      {
        src: '/trabalhos/lina-art-pet/gato-peca.webp',
        alt: 'Miniatura 3D do gato criada a partir da fotografia de referência.',
      },
      {
        src: '/trabalhos/lina-art-pet/luna-foto.webp',
        alt: 'Fotografia de referência da cadela Luna.',
      },
      {
        src: '/trabalhos/lina-art-pet/luna-peca.webp',
        alt: 'Miniatura 3D da cadela Luna criada pela Lina Art Pet.',
      },
    ],
  },
] as const;

export function trabalhoPorId(id: TrabalhoId): Trabalho {
  const trabalho = trabalhos.find((item) => item.id === id);
  if (!trabalho) throw new Error(`Trabalho não encontrado: ${id}`);
  return trabalho;
}

