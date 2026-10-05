import { SOFTWARE } from '@/content/software';
import type { Categoria, Envio, Opcao, Produto } from './tipos';

/**
 * O catálogo com que a loja nasce, para o titular editar no painel.
 *
 * Um boneco 3D, uma camiseta e uma caneca de cada jogo, o Livro de Morvelio nas duas versões e
 * os dois itens da marca. Tudo entra "Sob encomenda", com o preço sugerido abaixo: o titular
 * ajusta preço, disponibilidade e textos no painel, e o prazo da encomenda na configuração da loja.
 * As imagens (`public/loja/exemplos`) são ilustrações do produto; as fotos de verdade, quando
 * houver, chegam pelo painel.
 *
 * Entram uma vez só (ver `garantirExemplos` no repositório): apagado no painel, não volta. No
 * banco que já tinha os exemplos, preços, disponibilidade e imagens chegaram pela migration 006.
 */

type Exemplo = Omit<Produto, 'id' | 'criadoEm' | 'atualizadoEm'>;

/**
 * Os jogos do estúdio, na ordem do site, com o que aparece nas imagens: o personagem do boneco e
 * a arte da camiseta e da caneca. É a descrição da imagem (o `alt`), não do jogo.
 */
export const JOGOS_DA_LOJA = [
  { id: 'revalio', nome: 'Revalio', boneco: 'o mascote azul, de jaleco e estetoscópio, segurando uma prancheta', arte: 'o mascote azul' },
  { id: 'docalio', nome: 'Docalio', boneco: 'o personagem de óculos e jaleco, com a maleta de primeiros socorros', arte: 'o emblema com a mochila de primeiros socorros' },
  { id: 'gramelio', nome: 'Gramelio', boneco: 'a vaquinha de sino no pescoço, com grama aos pés', arte: 'a vaquinha no campo' },
  { id: 'catelio', nome: 'Catelio', boneco: 'o gato laranja', arte: 'o gato laranja na cidade à noite' },
  { id: 'morvelio', nome: 'Morvelio', boneco: 'o velho de barba branca, casaco roxo e bolsa de couro', arte: 'Morvelio diante do castelo, ao pôr do sol' },
  { id: 'mazelio', nome: 'Mazelio', boneco: 'o rei de coroa, armadura azul e capa vermelha', arte: 'o rei entre as torres' },
  { id: 'socialio', nome: 'Socialio', boneco: 'o jogador de fone de ouvido e moletom verde', arte: 'os amigos jogando à mesa' },
] as const;

/** Preços sugeridos, em centavos, para o titular ajustar no painel. */
export const PRECO_SUGERIDO = {
  boneco: 14990,
  camisetaDeJogo: 8990,
  camisetaDaMarca: 7990,
  caneca: 5490,
  copo: 7990,
  livroDigital: 3990,
  livroColecionador: 14990,
} as const;

/** Pacote já embalado, para a cotação do frete. O titular ajusta no painel com o produto real. */
const PACOTE: Record<'boneco' | 'camiseta' | 'caneca' | 'copo' | 'livro', Envio> = {
  boneco: { pesoKg: 0.4, alturaCm: 15, larguraCm: 12, comprimentoCm: 12 },
  camiseta: { pesoKg: 0.3, alturaCm: 4, larguraCm: 25, comprimentoCm: 30 },
  caneca: { pesoKg: 0.6, alturaCm: 12, larguraCm: 12, comprimentoCm: 15 },
  copo: { pesoKg: 0.4, alturaCm: 15, larguraCm: 10, comprimentoCm: 10 },
  livro: { pesoKg: 0.9, alturaCm: 5, larguraCm: 23, comprimentoCm: 30 },
};

const tamanhos = (precoCentavos: number): Opcao[] =>
  ['P', 'M', 'G', 'GG'].map((t) => ({ id: t.toLowerCase(), rotulo: t, precoCentavos, digital: false }));
const unica = (precoCentavos: number): Opcao[] => [{ id: 'padrao', rotulo: 'Padrão', precoCentavos, digital: false }];

const arte = (arquivo: string, alt: string) => ({ id: arquivo, url: `/loja/exemplos/${arquivo}.jpg`, alt });

function exemplo(
  slug: string, nome: string, categoria: Categoria, colecao: string, resumo: string, descricao: string[],
  opcoes: Opcao[], envio: Envio, imagens: ReturnType<typeof arte>[], ordem: number, rotuloOpcoes = '',
): Exemplo {
  return {
    slug, nome, resumo, descricao: descricao.join('\n\n'), categoria, colecao, disponibilidade: 'SOB_ENCOMENDA', status: 'PUBLICADO',
    rotuloOpcoes, opcoes, imagens, envio, ordem,
  };
}

const porJogo = JOGOS_DA_LOJA.flatMap(({ id, nome, boneco, arte: estampa }, i) => [
  exemplo(
    `boneco-3d-${id}`, `Boneco 3D de ${nome}`, 'colecionaveis', nome,
    `${nome} em miniatura, impresso em 3D.`,
    [`Um boneco de ${nome} impresso em 3D, para a estante ou a mesa de trabalho.`],
    unica(PRECO_SUGERIDO.boneco), PACOTE.boneco, [arte(`boneco-${id}`, `Boneco 3D de ${nome}: ${boneco}, sobre a base com o nome do jogo.`)], 100 + i,
  ),
  exemplo(
    `camiseta-${id}`, `Camiseta ${nome}`, 'vestuario', nome,
    `A arte de ${nome} numa camiseta.`,
    [`Camiseta com a arte de ${nome}.`, 'Tamanhos de P a GG.'],
    tamanhos(PRECO_SUGERIDO.camisetaDeJogo), PACOTE.camiseta, [arte(`camiseta-${id}`, `Camiseta preta com a arte de ${nome} no peito: ${estampa}.`)], 200 + i, 'Tamanho',
  ),
  exemplo(
    `caneca-${id}`, `Caneca ${nome}`, 'casa', nome,
    `A arte de ${nome} na caneca do café.`,
    [`Caneca com a arte de ${nome}, para o café de todo dia.`],
    unica(PRECO_SUGERIDO.caneca), PACOTE.caneca, [arte(`caneca-${id}`, `Caneca branca de cerâmica com a arte de ${nome}: ${estampa}.`)], 300 + i,
  ),
]);

export const EXEMPLOS: Exemplo[] = [
  ...porJogo,
  exemplo(
    'camiseta-blajeen-labs', 'Camiseta Blajeen Labs', 'vestuario', 'Blajeen Labs',
    'A marca do laboratório, para vestir.',
    ['Camiseta com a marca da Blajeen Labs: o laboratório, os olhos acesos e a gosma verde-ácido.', 'Tamanhos de P a GG.'],
    tamanhos(PRECO_SUGERIDO.camisetaDaMarca), PACOTE.camiseta,
    [arte('camiseta-blajeen', 'Camiseta preta com o emblema da Blajeen Labs no peito: o frasco de gosma verde-ácido.')], 290, 'Tamanho',
  ),
  exemplo(
    'copo-blajeen-labs', 'Copo Blajeen Labs', 'casa', 'Blajeen Labs',
    'O copo do laboratório, com o frasco de gosma verde-ácido.',
    ['Copo térmico com tampa e o frasco de gosma da Blajeen Labs, o mesmo que vive no canto do site.'],
    unica(PRECO_SUGERIDO.copo), PACOTE.copo, [arte('copo-blajeen', 'Copo térmico preto, com tampa, e o frasco de gosma verde-ácido da Blajeen Labs.')], 390,
  ),
  exemplo(
    'livro-de-morvelio', 'Livro de Morvelio', 'livros', 'Morvelio',
    'O universo de Morvelio nas páginas de um livro, em versão digital ou física de colecionador.',
    [
      'O universo de Morvelio nasce também nas páginas de um livro: famílias, ofícios, relíquias e escolhas dão significado a cada lugar de Velidor, e a história se abre para os cinco reinos de Erdávia.',
      'Duas versões: a digital, em e-book, e a física, numa edição pensada para colecionadores.',
    ],
    [
      { id: 'digital', rotulo: 'Digital (e-book)', precoCentavos: PRECO_SUGERIDO.livroDigital, digital: true },
      { id: 'colecionador', rotulo: 'Física — edição de colecionador', precoCentavos: PRECO_SUGERIDO.livroColecionador, digital: false },
    ],
    PACOTE.livro,
    [
      arte('livro-morvelio-colecionador', 'Edição de colecionador do Livro de Morvelio, de capa dura, saindo da luva roxa.'),
      arte('livro-morvelio-digital', 'A capa do Livro de Morvelio na tela de um tablet.'),
    ],
    400, 'Versão',
  ),
];

/**
 * O software não vai pelo correio: a opção é digital e o frete nunca é cotado. O pacote existe só
 * porque todo produto do painel tem um.
 */
const SEM_PACOTE: Envio = { pesoKg: 0.1, alturaCm: 1, larguraCm: 10, comprimentoCm: 10 };

/**
 * Os sistemas à venda (`src/content/software.ts`), um produto cada: venda única, com uma opção
 * digital — código, site e marca — e as três telas da ficha como fotos. A descrição é a do sistema;
 * o que vem na compra a página do software diz para todos. Entram num lote próprio (ver
 * `garantirExemplos`), porque o banco de produção já tinha os exclusivos quando eles chegaram.
 */
export const SOFTWARE_DA_LOJA: Exemplo[] = SOFTWARE.map((software, i) => ({
  slug: software.slug,
  nome: software.nome,
  resumo: software.resumo,
  descricao: software.descricao,
  categoria: 'software',
  colecao: software.segmento,
  disponibilidade: 'DISPONIVEL',
  status: 'PUBLICADO',
  rotuloOpcoes: '',
  opcoes: [{ id: 'padrao', rotulo: 'Código, site e marca', precoCentavos: software.precoSugerido, digital: true }],
  imagens: software.telas.map((tela, n) => ({ id: `${software.slug}-${n + 1}`, url: tela.src, alt: tela.descricao })),
  envio: SEM_PACOTE,
  ordem: 10 + i,
}));
