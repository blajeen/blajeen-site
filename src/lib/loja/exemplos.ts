import type { Categoria, Envio, Opcao, Produto } from './tipos';

/**
 * O catálogo com que a loja nasce, para o titular editar no painel.
 *
 * Um boneco 3D, uma camiseta e uma caneca de cada jogo, o Livro de Morvelio nas duas versões e
 * os dois itens da marca. Tudo entra "Em breve": sem preço à mostra e sem botão de compra, até o
 * titular definir preço e disponibilidade no painel (que não deixa sair de "Em breve" com preço
 * zerado). As imagens são montagens ilustrativas, marcadas como tais, geradas por
 * `tools/gerar-artes-da-loja.mjs` até as fotos de verdade chegarem pelo painel.
 *
 * Entram uma vez só (ver `garantirExemplos` no repositório): apagado no painel, não volta.
 */

type Exemplo = Omit<Produto, 'id' | 'criadoEm' | 'atualizadoEm'>;

/** Os jogos do estúdio, na ordem do site. */
export const JOGOS_DA_LOJA = [
  { id: 'revalio', nome: 'Revalio' },
  { id: 'docalio', nome: 'Docalio' },
  { id: 'gramelio', nome: 'Gramelio' },
  { id: 'catelio', nome: 'Catelio' },
  { id: 'morvelio', nome: 'Morvelio' },
  { id: 'mazelio', nome: 'Mazelio' },
  { id: 'socialio', nome: 'Socialio' },
] as const;

/** Pacote já embalado, para a cotação do frete. O titular ajusta no painel com o produto real. */
const PACOTE: Record<'boneco' | 'camiseta' | 'caneca' | 'copo' | 'livro', Envio> = {
  boneco: { pesoKg: 0.4, alturaCm: 15, larguraCm: 12, comprimentoCm: 12 },
  camiseta: { pesoKg: 0.3, alturaCm: 4, larguraCm: 25, comprimentoCm: 30 },
  caneca: { pesoKg: 0.6, alturaCm: 12, larguraCm: 12, comprimentoCm: 15 },
  copo: { pesoKg: 0.4, alturaCm: 15, larguraCm: 10, comprimentoCm: 10 },
  livro: { pesoKg: 0.9, alturaCm: 5, larguraCm: 23, comprimentoCm: 30 },
};

const tamanhos: Opcao[] = ['P', 'M', 'G', 'GG'].map((t) => ({ id: t.toLowerCase(), rotulo: t, precoCentavos: 0, digital: false }));
const unica: Opcao[] = [{ id: 'padrao', rotulo: 'Padrão', precoCentavos: 0, digital: false }];

const arte = (arquivo: string, alt: string) => ({ id: arquivo, url: `/loja/exemplos/${arquivo}.jpg`, alt });

function exemplo(
  slug: string, nome: string, categoria: Categoria, colecao: string, resumo: string, descricao: string[],
  opcoes: Opcao[], envio: Envio, imagens: ReturnType<typeof arte>[], ordem: number, rotuloOpcoes = '',
): Exemplo {
  return {
    slug, nome, resumo, descricao: descricao.join('\n\n'), categoria, colecao, disponibilidade: 'EM_BREVE', status: 'PUBLICADO',
    rotuloOpcoes, opcoes, imagens, envio, ordem,
  };
}

const porJogo = JOGOS_DA_LOJA.flatMap(({ id, nome }, i) => [
  exemplo(
    `boneco-3d-${id}`, `Boneco 3D de ${nome}`, 'colecionaveis', nome,
    `${nome} em miniatura, impresso em 3D.`,
    [`Um boneco de ${nome} impresso em 3D, para a estante ou a mesa de trabalho.`],
    unica, PACOTE.boneco, [arte(`boneco-${id}`, `Montagem ilustrativa do boneco 3D de ${nome} sobre a base`)], 100 + i,
  ),
  exemplo(
    `camiseta-${id}`, `Camiseta ${nome}`, 'vestuario', nome,
    `A arte de ${nome} numa camiseta.`,
    [`Camiseta com a arte de ${nome}.`, 'Tamanhos de P a GG.'],
    tamanhos, PACOTE.camiseta, [arte(`camiseta-${id}`, `Montagem ilustrativa da camiseta ${nome}`)], 200 + i, 'Tamanho',
  ),
  exemplo(
    `caneca-${id}`, `Caneca ${nome}`, 'casa', nome,
    `A arte de ${nome} na caneca do café.`,
    [`Caneca com a arte de ${nome}, para o café de todo dia.`],
    unica, PACOTE.caneca, [arte(`caneca-${id}`, `Montagem ilustrativa da caneca ${nome}`)], 300 + i,
  ),
]);

export const EXEMPLOS: Exemplo[] = [
  ...porJogo,
  exemplo(
    'camiseta-blajeen-labs', 'Camiseta Blajeen Labs', 'vestuario', 'Blajeen Labs',
    'A marca do laboratório, para vestir.',
    ['Camiseta com a marca da Blajeen Labs: o laboratório, os olhos acesos e a gosma verde-ácido.', 'Tamanhos de P a GG.'],
    tamanhos, PACOTE.camiseta, [arte('camiseta-blajeen', 'Montagem ilustrativa da camiseta Blajeen Labs')], 290, 'Tamanho',
  ),
  exemplo(
    'copo-blajeen-labs', 'Copo Blajeen Labs', 'casa', 'Blajeen Labs',
    'O copo do laboratório, com o frasco de gosma verde-ácido.',
    ['Copo com o frasco de gosma da Blajeen Labs, o mesmo que vive no canto do site.'],
    unica, PACOTE.copo, [arte('copo-blajeen', 'Montagem ilustrativa do copo Blajeen Labs')], 390,
  ),
  exemplo(
    'livro-de-morvelio', 'Livro de Morvelio', 'livros', 'Morvelio',
    'O universo de Morvelio nas páginas de um livro, em versão digital ou física de colecionador.',
    [
      'O universo de Morvelio nasce também nas páginas de um livro: famílias, ofícios, relíquias e escolhas dão significado a cada lugar de Velidor, e a história se abre para os cinco reinos de Erdávia.',
      'Duas versões: a digital, em e-book, e a física, numa edição pensada para colecionadores.',
    ],
    [
      { id: 'digital', rotulo: 'Digital (e-book)', precoCentavos: 0, digital: true },
      { id: 'colecionador', rotulo: 'Física — edição de colecionador', precoCentavos: 0, digital: false },
    ],
    PACOTE.livro,
    [
      arte('livro-morvelio-colecionador', 'Montagem ilustrativa da edição física de colecionador do Livro de Morvelio'),
      arte('livro-morvelio-digital', 'Montagem ilustrativa da versão digital do Livro de Morvelio, aberta num tablet'),
    ],
    400, 'Versão',
  ),
];
