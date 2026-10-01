import type { Metadata } from 'next';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { CartaoProduto } from '@/components/loja/CartaoProduto';
import { LinkDaSacola } from '@/components/loja/LinkDaSacola';
import { asaasConfigurado } from '@/lib/loja/asaas';
import { listarProdutos } from '@/lib/loja/repositorio';
import { CATEGORIA_ROTULO, CATEGORIAS } from '@/lib/loja/tipos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Loja — Exclusivos da Blajeen Labs',
  descricao:
    'Bonecos 3D, camisetas e canecas dos jogos da Blajeen Labs, e o Livro de Morvelio em versão digital e de colecionador.',
  rota: ROTAS.loja,
});

// Os produtos vêm do painel. Um minuto de cache, e o painel atualiza na hora quando salva.
export const revalidate = 60;

const PASSOS_COM_PAGAMENTO = [
  { n: '01', titulo: 'Escolha', texto: 'Monte a sacola com os exclusivos, o tamanho e a versão que quiser.' },
  { n: '02', titulo: 'Calcule o frete', texto: 'Pelo CEP, com as opções das transportadoras, preço e prazo.' },
  { n: '03', titulo: 'Pague com segurança', texto: 'Pix, cartão ou boleto na página do Asaas. O pedido segue para preparo.' },
];

const PASSOS_COM_CONTATO = [
  { n: '01', titulo: 'Escolha', texto: 'Monte a sacola com os exclusivos, o tamanho e a versão que quiser.' },
  { n: '02', titulo: 'Deixe seu contato', texto: 'Nome, e-mail e WhatsApp. Nenhum pagamento é feito no site.' },
  { n: '03', titulo: 'A gente confirma', texto: 'O estúdio fala com você para acertar frete e pagamento.' },
];

export default async function LojaPage() {
  const produtos = await listarProdutos({ publicados: true }).catch(() => []);
  const passos = asaasConfigurado() ? PASSOS_COM_PAGAMENTO : PASSOS_COM_CONTATO;
  const grupos = CATEGORIAS.map((categoria) => ({ categoria, itens: produtos.filter((p) => p.categoria === categoria) }))
    .filter((g) => g.itens.length);

  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">LOJA / EXCLUSIVOS DO LABORATÓRIO</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-[13ch] text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em] lg:col-span-8">
              Feito no laboratório. Para levar.
            </h1>
            <div className="lg:col-span-4 lg:pb-2">
              <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
                Bonecos 3D, camisetas e canecas de cada jogo do estúdio, e o Livro de Morvelio em versão digital e de
                colecionador.
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
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grupo.itens.map((produto, i) => (
              <li key={produto.id}><CartaoProduto produto={produto} prioridade={indice === 0 && i < 4} /></li>
            ))}
          </ul>
        </Section>
      )) : (
        <Section rotulo="Exclusivos">
          <p className="rounded-[var(--radius-panel)] border border-line p-8 text-mineral">A vitrine está sendo arrumada. Volte em breve.</p>
        </Section>
      )}

      <Section indice={`0${grupos.length + 1} / COMO FUNCIONA O PEDIDO`} rotuladaPor="como-funciona" className="pb-[clamp(4rem,9vw,9rem)]">
        <h2 id="como-funciona" className="sr-only">Como funciona o pedido</h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {passos.map((passo) => (
            <li key={passo.n} className="rounded-[var(--radius-panel)] border border-line p-7">
              <p className="tecnica text-signal">{passo.n}</p>
              <h3 className="mt-4 text-2xl tracking-[-0.03em]">{passo.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mineral">{passo.texto}</p>
            </li>
          ))}
        </ol>
        <p className="medida-texto mt-6 text-xs leading-relaxed text-mineral-dim">
          Imagens marcadas como ilustrativas são montagens, não fotos do produto final.
        </p>
      </Section>
    </>
  );
}
