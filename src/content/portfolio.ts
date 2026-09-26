import { ROTAS } from '@/lib/routes';

export type TrabalhoId = 'dom-guima' | 'lina-art-pet' | 'dona-lia' | 'spot-hotel' | 'agro-weld';

export type Trabalho = {
  readonly id: TrabalhoId;
  readonly cliente: string;
  readonly categoria: string;
  readonly resumo: string;
  readonly desafio: string;
  readonly solucao: string;
  readonly tituloEntrega?: string;
  readonly contribuicoes: readonly string[];
  readonly capa: string;
  readonly capaAlt: string;
  readonly href: string;
  readonly site: string;
  readonly siteRotulo: string;
  readonly fase?: string;
  readonly formatoImagens?: 'telas' | 'fotografias';
  readonly imagens: readonly { src: string; alt: string }[];
};

export const trabalhos: readonly Trabalho[] = [
  {
    id: 'dom-guima',
    cliente: 'Dom Guima',
    categoria: 'E-COMMERCE / OPERAÇÃO DIGITAL',
    resumo:
      'E-commerce multimarcas de Uberlândia com catálogo, busca, ofertas e um painel sob medida para o proprietário cuidar de produtos, estoque e operação.',
    desafio:
      'Reunir um catálogo diverso em uma experiência clara, rápida de consultar e simples de manter pela própria operação.',
    solucao:
      'A loja evoluiu para reunir navegação por categorias, busca, ofertas, páginas de produto, carrinho e fechamento assistido. O painel privado também foi ampliado para o proprietário gerenciar produtos, imagens, preços, estoque, pedidos e a operação diária.',
    tituloEntrega: 'Uma loja que vende e uma operação que acompanha.',
    contribuicoes: [
      'Arquitetura e experiência da loja',
      'Catálogo, busca e páginas de produto',
      'Carrinho e fluxo de compra assistido',
      'Painel personalizado para produtos, estoque, pedidos e ofertas',
      'SEO e dados estruturados',
      'Consulta de CEP com serviços reais',
    ],
    capa: '/trabalhos/dom-guima/capa-atual.webp',
    capaAlt: 'Página inicial atual da loja Dom Guima, com vitrine, navegação e ofertas.',
    href: ROTAS.trabalhoDomGuima,
    site: 'https://www.domguima.com.br',
    siteRotulo: 'VISITAR DOM GUIMA',
    formatoImagens: 'telas',
    imagens: [
      {
        src: '/trabalhos/dom-guima/busca-atual.webp',
        alt: 'Busca de produtos no site atual da Dom Guima.',
      },
      {
        src: '/trabalhos/dom-guima/produto-atual.webp',
        alt: 'Página de produto da loja Dom Guima.',
      },
    ],
  },
  {
    id: 'dona-lia',
    cliente: 'Pousada Dona Lia',
    categoria: 'HOSPEDAGEM / SITE / GESTÃO',
    fase: 'EM HOMOLOGAÇÃO',
    resumo: 'Presença digital para uma pousada, com apresentação das acomodações, contato direto e painel privado para organizar reservas.',
    desafio: 'Apresentar os quartos com clareza e dar à equipe um fluxo próprio para acompanhar a operação sem depender de planilhas dispersas.',
    solucao: 'Construímos um site responsivo para conhecer a pousada e suas acomodações, com contato via WhatsApp, conectado a um painel privado de gestão de reservas. O projeto está em homologação.',
    tituloEntrega: 'Hospitalidade na vitrine. Organização nos bastidores.',
    contribuicoes: [
      'Estrutura e identidade da experiência digital',
      'Apresentação das acomodações',
      'Jornada de contato e reserva',
      'Painel privado de reservas',
      'Adaptação para celular e desktop',
    ],
    capa: '/trabalhos/dona-lia/capa-site.webp',
    capaAlt: 'Página inicial da Pousada Dona Lia com apresentação do espaço.',
    href: ROTAS.trabalhoDonaLia,
    site: 'https://www.donaliahotel.com.br',
    siteRotulo: 'VER PRÉVIA DA POUSADA',
    formatoImagens: 'telas',
    imagens: [
      { src: '/trabalhos/dona-lia/acomodacoes.webp', alt: 'Página das acomodações da Pousada Dona Lia.' },
      { src: '/trabalhos/dona-lia/sobre.webp', alt: 'Página sobre a Pousada Dona Lia.' },
    ],
  },
  {
    id: 'spot-hotel',
    cliente: 'Spot Hotel e Pousada',
    categoria: 'HOSPEDAGEM / SITE / GESTÃO',
    fase: 'EM HOMOLOGAÇÃO',
    resumo: 'Site de hospedagem com foco em quartos e reservas, acompanhado de um painel próprio para agenda, hóspedes e operação.',
    desafio: 'Unir uma apresentação acolhedora para o hóspede a ferramentas claras para quem administra acomodações e reservas.',
    solucao: 'Desenvolvemos o site público e um painel privado para acompanhar quartos, agenda, reservas, hóspedes e ocorrências. O projeto está em homologação.',
    tituloEntrega: 'Um caminho para o hóspede. Outro para a equipe.',
    contribuicoes: [
      'Arquitetura da experiência de hospedagem',
      'Vitrine de quartos e informações úteis',
      'Jornada de contato para reservas',
      'Painel de agenda e reservas',
      'Gestão de hóspedes e ocorrências',
    ],
    capa: '/trabalhos/spot-hotel/capa-site.webp',
    capaAlt: 'Página inicial do Spot Hotel e Pousada apresentando a hospedagem.',
    href: ROTAS.trabalhoSpotHotel,
    site: 'https://www.spothotel.com.br',
    siteRotulo: 'VER PRÉVIA DO HOTEL',
    formatoImagens: 'telas',
    imagens: [
      { src: '/trabalhos/spot-hotel/acomodacoes.webp', alt: 'Página das acomodações do Spot Hotel e Pousada.' },
      { src: '/trabalhos/spot-hotel/sobre.webp', alt: 'Página sobre o Spot Hotel e Pousada.' },
    ],
  },
  {
    id: 'agro-weld',
    cliente: 'Agro Weld',
    categoria: 'COMÉRCIO / CATÁLOGO DIGITAL',
    resumo: 'Vitrine digital de EPIs em couro, vestimentas agrícolas e uniformes, com navegação por produtos e caminhos para compra ou orçamento.',
    desafio: 'Organizar linhas de produtos técnicos em uma experiência comercial fácil de explorar e coerente com a identidade da marca.',
    solucao: 'Criamos um site responsivo com apresentação institucional, catálogo, páginas de produtos e caminhos de contato para compra ou orçamento, de acordo com a jornada do cliente.',
    tituloEntrega: 'Produtos técnicos com uma vitrine clara.',
    contribuicoes: [
      'Estratégia de apresentação da marca',
      'Catálogo e organização por categorias',
      'Páginas de produto',
      'Jornada de compra e orçamento',
      'Experiência responsiva',
    ],
    capa: '/trabalhos/agro-weld/capa-site.webp',
    capaAlt: 'Página inicial da Agro Weld com apresentação da marca e dos produtos.',
    href: ROTAS.trabalhoAgroWeld,
    site: 'https://www.agroweld.com.br',
    siteRotulo: 'VISITAR AGRO WELD',
    formatoImagens: 'telas',
    imagens: [
      { src: '/trabalhos/agro-weld/produtos.webp', alt: 'Vitrine de produtos da Agro Weld.' },
      { src: '/trabalhos/agro-weld/catalogo.webp', alt: 'Catálogo de produtos da Agro Weld.' },
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
    tituloEntrega: 'Da foto do pet a uma experiência com afeto.',
    contribuicoes: [
      'Narrativa e arquitetura do site',
      'Jornada de personalização em nove etapas',
      'Visualização 3D do produto',
      'Catálogo e carrinho',
      'Galeria e comparativos com trabalhos reais',
      'Fluxo de orçamento pelo WhatsApp',
    ],
    capa: '/trabalhos/lina-art-pet/capa-site.webp',
    capaAlt: 'Tela do site Lina Art Pet comparando a fotografia de um pet com sua miniatura 3D personalizada.',
    href: ROTAS.trabalhoLinaArtPet,
    site: 'https://linaartpet.com.br',
    siteRotulo: 'VISITAR LINA ART PET',
    imagens: [
      {
        src: '/trabalhos/lina-art-pet/lina-foto.webp',
        alt: 'Fotografia de referência da cadela Lina enviada para a criação da miniatura personalizada.',
      },
      {
        src: '/trabalhos/lina-art-pet/lina-peca.webp',
        alt: 'Miniatura 3D da cadela Lina criada a partir da fotografia de referência.',
      },
      {
        src: '/trabalhos/lina-art-pet/pomada-foto.webp',
        alt: 'Fotografia de referência da cadela Pomada enviada para a criação da miniatura personalizada.',
      },
      {
        src: '/trabalhos/lina-art-pet/pomada-peca.webp',
        alt: 'Miniatura 3D da cadela Pomada criada a partir da fotografia de referência.',
      },
    ],
  },
] as const;

export function trabalhoPorId(id: TrabalhoId): Trabalho {
  const trabalho = trabalhos.find((item) => item.id === id);
  if (!trabalho) throw new Error(`Trabalho não encontrado: ${id}`);
  return trabalho;
}

