import { definido, pendente, type Campo } from './blockers';

/**
 * Identidade pública do estúdio.
 *
 * Só entra aqui o que está confirmado por documento auditado. O resto é `pendente(...)` e
 * aparece na interface como estado explícito, nunca como texto plausível.
 */
export const site = {
  nome: 'Blajeen Labs',
  wordmark: 'BLAJEEN',
  qualificador: 'LABS',
  posicionamento: 'DESENVOLVIMENTO DE SOFTWARE / JOGOS / LABORATÓRIO DE IDEIAS',
  assinatura: 'Build strange things. Make them matter.',
  descricao:
    'Estúdio independente de engenharia de software aplicada, produtos digitais e jogos.',
  footerLinha: 'Engenharia de software aplicada a ideias, negócios e produtos digitais.',
  ano: 2026,
  idioma: 'pt-BR',
  instagram: {
    rotulo: '@blajeenlab',
    url: 'https://www.instagram.com/blajeenlab/',
  },

  /**
   * Titularidade dos elementos originais confirmada em
   * `C:\dev\revalio\docs\publicacao\INVENTARIO_RELEASE.md` e `DECISOES_DO_TITULAR.md`.
   * A forma jurídica publicável continua bloqueada, por isso o nome não vai aos documentos legais.
   */
  titular: pendente('titularNome') satisfies Campo<string>,
  documento: pendente('titularDocumento') satisfies Campo<string>,
  endereco: pendente('titularEndereco') satisfies Campo<string>,
  canalLgpd: pendente('canalLgpd') satisfies Campo<string>,
  prazoExclusao: pendente('prazoExclusao') satisfies Campo<string>,

  /**
   * Endereço institucional da Blajeen Labs, confirmado pelo titular em 17 de agosto de 2026.
   * Substitui o `hello@blajeenlabs.com` fictício do protótipo. Vale para assuntos do estúdio;
   * cada jogo tem canal próprio.
   */
  emailEstudio: definido(
    'brg.ftw@gmail.com',
    'Confirmado pelo titular em 17/08/2026, com a grafia verificada.',
  ) satisfies Campo<string>,

  /**
   * Único canal de contato auditado do ecossistema. Confirmado em
   * `C:\dev\revalio\docs\publicacao\INVENTARIO_RELEASE.md` (e-mail de suporte do app),
   * `CONTEUDO_PAGINA_DE_EXCLUSAO.md` e `RASCUNHO_POLITICA_DE_PRIVACIDADE.md`.
   */
  emailRevalio: definido(
    'contato.revalio@gmail.com',
    'C:\\dev\\revalio\\docs\\publicacao\\INVENTARIO_RELEASE.md, reconfirmado pelo titular em 17/08/2026.',
  ) satisfies Campo<string>,

  /**
   * Canal próprio do Docalio, confirmado pelo titular em 17 de agosto de 2026.
   * A caixa precisa estar recebendo mensagens antes do primeiro envio às lojas: Apple e Google
   * verificam o endereço informado na ficha do aplicativo.
   */
  emailDocalio: definido(
    'contato.docalio@gmail.com',
    'Confirmado pelo titular em 17/08/2026.',
  ) satisfies Campo<string>,

  /**
   * Canal próprio do Gramelio, confirmado pelo titular em 20 de agosto de 2026.
   * Segue o mesmo padrão dos outros dois — o que valida o endereço é a confirmação, não o padrão.
   * A caixa precisa estar recebendo mensagens antes do primeiro envio às lojas.
   */
  emailGramelio: definido(
    'contato.gramelio@gmail.com',
    'Confirmado pelo titular em 20/08/2026.',
  ) satisfies Campo<string>,
} as const;

/**
 * Base absoluta para canonical, sitemap, robots e Open Graph.
 *
 * Ordem de precedência:
 * 1. `NEXT_PUBLIC_SITE_URL` — o domínio definitivo, quando existir;
 * 2. a URL de produção da Vercel — evita que um deploy de revisão publique canonical apontando
 *    para localhost;
 * 3. localhost, em desenvolvimento.
 */
/**
 * Uma variável definida como string vazia é o mesmo que não definida.
 * Sem isso, um campo em branco no painel de deploy geraria base de URL vazia e canonical quebrado.
 */
function variavel(valor: string | undefined): string | undefined {
  const limpo = valor?.trim();
  return limpo ? limpo : undefined;
}

/**
 * Domínio público ativo, com HTTPS e deploy verificados em 20 de agosto de 2026.
 * `NEXT_PUBLIC_SITE_URL` continua podendo sobrescrever, para ambientes de teste.
 */
const DOMINIO = 'https://blajeen.com.br';

const dominioProprio = variavel(process.env.NEXT_PUBLIC_SITE_URL) ?? DOMINIO;

export const SITE_URL = dominioProprio;

export const SITE_URL_DEFINIDO = true;

/**
 * O site só se oferece à indexação quando está pronto para publicar.
 *
 * Enquanto houver bloqueador humano aberto, os textos jurídicos são versões de trabalho — deixar
 * buscadores indexá-los criaria resultado permanente para política e termos ainda não aprovados,
 * possivelmente sob uma URL temporária. É a mesma chave usada por `npm run check:content`.
 */
export const SITE_INDEXAVEL = SITE_URL_DEFINIDO && variavel(process.env.SITE_PUBLICACAO) === '1';

export function urlAbsoluta(rota: string): string {
  return new URL(rota, SITE_URL).toString();
}
