import type { Metadata } from 'next';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { CartaoProduto } from '@/components/loja/CartaoProduto';
import { LinkDaSacola } from '@/components/loja/LinkDaSacola';
import { avisoDemonstracao } from '@/content/software';
import { asaasConfigurado } from '@/lib/loja/asaas';
import { CONFIGURACAO_PADRAO, lerConfiguracaoLoja, listarProdutos } from '@/lib/loja/repositorio';
import { CATEGORIA_ROTULO, CATEGORIAS, textoDoPrazoDeEncomenda, type Categoria } from '@/lib/loja/tipos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Loja — Software e exclusivos da Blajeen Labs',
  descricao:
    'Sistemas prontos vendidos inteiros, com código, site e marca, e os exclusivos dos jogos: bonecos 3D, camisetas, canecas e o Livro de Morvelio.',
  rota: ROTAS.loja,
});

// Os produtos vêm do painel. Um minuto de cache, e o painel atualiza na hora quando salva.
export const revalidate = 60;

const ESCOLHA = { n: '01', titulo: 'Escolha', texto: 'Monte a sacola com um sistema, os exclusivos, o tamanho e a versão que quiser.' };

const PASSOS_COM_PAGAMENTO = [
  ESCOLHA,
  { n: '02', titulo: 'Calcule o frete', texto: 'Pelo CEP, com as opções das transportadoras, preço e prazo. Software e e-book não têm frete.' },
  { n: '03', titulo: 'Pague com segurança', texto: 'Pix, cartão ou boleto na página do Asaas. O pedido segue para preparo.' },
];

const PASSOS_COM_CONTATO = [
  ESCOLHA,
  { n: '02', titulo: 'Deixe seu contato', texto: 'Nome, e-mail e WhatsApp. Nenhum pagamento é feito no site.' },
  { n: '03', titulo: 'A gente confirma', texto: 'O estúdio fala com você para acertar o pagamento e, se houver o que enviar, o frete.' },
];

/** O que a categoria Software tem de diferente, dito antes dos cartões. */
function IntroducaoDoSoftware() {
  return (
    <div className="mb-8 grid gap-4 lg:grid-cols-12 lg:items-end">
      <p className="text-[clamp(1.7rem,3vw,2.5rem)] leading-tight tracking-[-0.04em] lg:col-span-6">
        Sistemas prontos, vendidos inteiros.
      </p>
      <p className="medida-texto text-sm leading-relaxed text-mineral lg:col-span-6">
        O código-fonte, o site e a marca vão para quem compra, que pode manter o nome ou pedir para a gente trocar. Cada
        sistema é vendido uma vez só: depois da compra, ele sai de venda. Teste a demonstração na página de cada um.
      </p>
    </div>
  );
}

export default async function LojaPage() {
  const produtos = await listarProdutos({ publicados: true }).catch(() => []);
  const configuracao = await lerConfiguracaoLoja().catch(() => CONFIGURACAO_PADRAO);
  const passos = [
    ...(asaasConfigurado() ? PASSOS_COM_PAGAMENTO : PASSOS_COM_CONTATO),
    ...(produtos.some((p) => p.disponibilidade === 'SOB_ENCOMENDA') ? [{
      n: '04', titulo: 'Feito sob encomenda',
      texto: `Os exclusivos sob encomenda são produzidos depois que o pagamento é confirmado e chegam em ${textoDoPrazoDeEncomenda(configuracao)}.`,
    }] : []),
  ];
  const grupos = CATEGORIAS.map((categoria) => ({ categoria, itens: produtos.filter((p) => p.categoria === categoria) }))
    .filter((g) => g.itens.length);
  const ehSoftware = (categoria: Categoria) => categoria === 'software';

  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">LOJA / SOFTWARE E EXCLUSIVOS DO LABORATÓRIO</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-[13ch] text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em] lg:col-span-8">
              Feito no laboratório. Para levar.
            </h1>
            <div className="lg:col-span-4 lg:pb-2">
              <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
                Sistemas prontos para virar o seu negócio, vendidos com código, site e marca. E os exclusivos dos jogos:
                bonecos 3D, camisetas, canecas e o Livro de Morvelio.
              </p>
              {grupos.length > 1 ? (
                <nav aria-label="Categorias da loja" className="mt-6 flex flex-wrap gap-2">
                  {grupos.map((g) => (
                    <a key={g.categoria} href={`#${g.categoria}`}
                      className="alvo-toque inline-flex items-center rounded-full border border-line-strong px-4 text-sm text-mineral transition-colors hover:border-signal hover:text-paper">
                      {CATEGORIA_ROTULO[g.categoria]}
                    </a>
                  ))}
                </nav>
              ) : null}
              <div className="mt-4"><LinkDaSacola /></div>
            </div>
          </div>
        </Container>
      </header>

      {grupos.length ? grupos.map((grupo, indice) => (
        <Section key={grupo.categoria} id={grupo.categoria} indice={`0${indice + 1} / ${CATEGORIA_ROTULO[grupo.categoria].toUpperCase()}`}
          rotuladaPor={`titulo-${grupo.categoria}`} className="scroll-mt-20 pb-0">
          <h2 id={`titulo-${grupo.categoria}`} className="sr-only">{CATEGORIA_ROTULO[grupo.categoria]}</h2>
          {ehSoftware(grupo.categoria) ? <IntroducaoDoSoftware /> : null}
          <ul className={`grid gap-5 sm:grid-cols-2 ${ehSoftware(grupo.categoria) ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
            {grupo.itens.map((produto, i) => (
              <li key={produto.id}><CartaoProduto produto={produto} prioridade={indice === 0 && i < 4} /></li>
            ))}
          </ul>
          {ehSoftware(grupo.categoria) ? (
            <p className="medida-texto mt-6 text-xs leading-relaxed text-mineral-dim">{avisoDemonstracao}</p>
          ) : null}
        </Section>
      )) : (
        <Section rotulo="Produtos da loja">
          <p className="rounded-[var(--radius-panel)] border border-line p-8 text-mineral">A vitrine está sendo arrumada. Volte em breve.</p>
        </Section>
      )}

      <Section indice={`0${grupos.length + 1} / COMO FUNCIONA O PEDIDO`} rotuladaPor="como-funciona" className="pb-[clamp(4rem,9vw,9rem)]">
        <h2 id="como-funciona" className="sr-only">Como funciona o pedido</h2>
        <ol className={`grid gap-5 ${passos.length > 3 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3'}`}>
          {passos.map((passo) => (
            <li key={passo.n} className="rounded-[var(--radius-panel)] border border-line p-7">
              <p className="tecnica text-signal">{passo.n}</p>
              <h3 className="mt-4 text-2xl tracking-[-0.03em]">{passo.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mineral">{passo.texto}</p>
            </li>
          ))}
        </ol>
        <p className="medida-texto mt-6 text-xs leading-relaxed text-mineral-dim">
          As imagens dos exclusivos são ilustrativas: cor, acabamento e proporções do produto final podem ter pequenas diferenças.
        </p>
      </Section>
    </>
  );
}
