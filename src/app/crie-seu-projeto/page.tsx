import type { Metadata } from 'next';
import Link from 'next/link';
import { AppliedEngineeringIcon } from '@/components/brand/AppliedEngineeringIcon';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { CustomProjectForm } from '@/components/contact/CustomProjectForm';
import { Container, Section } from '@/components/layout/Section';
import { SERVICOS_IDS, type PlanoCatalogo, type ServicoCatalogo, type ServicoId } from '@/content/contratos/tipos';
import { projetoPersonalizado, tipoDoPlano } from '@/content/custom-project';
import { catalogoVigente, DESCRICAO_CURTA, planoInicial, precoDoAdicional } from '@/lib/contracts/catalogo';
import { carregarCatalogo } from '@/lib/contracts/service';
import { reais } from '@/lib/contracts/valores';
import { metadadosDaRota } from '@/lib/metadata';
import { TIPOS_DE_PROJETO, type TipoDeProjeto } from '@/lib/pedidos/types';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Crie seu projeto — Blajeen Labs',
  descricao: 'Valores de sites, sistemas, vídeos, jogos e projetos sob medida da Blajeen Labs. Veja os planos, baixe o catálogo e peça seu orçamento.',
  rota: ROTAS.crieSeuProjeto,
});

/** O catálogo em A4, com os mesmos valores desta página, para baixar em PDF. */
const ROTA_DO_CATALOGO = `${ROTAS.crieSeuProjeto}/catalogo`;

const botao = 'alvo-toque tecnica inline-flex items-center rounded-full px-5 transition-colors';

/** "Pedir este plano" abre o formulário já com o tipo marcado e o plano escrito. */
function linkDoPlano(id: ServicoId, servico: ServicoCatalogo, plano: PlanoCatalogo): string {
  const valor = `${plano.aPartir ? 'a partir de ' : ''}${reais(plano.preco)}${plano.unidade}`;
  const parametros = new URLSearchParams({
    tipo: tipoDoPlano(id, plano.id),
    ideia: `Quero o plano ${plano.nome} (${servico.nome}, ${valor}).`,
  });
  return `${ROTAS.crieSeuProjeto}?${parametros.toString()}#comecar`;
}

function Plano({ id, servico, plano }: { id: ServicoId; servico: ServicoCatalogo; plano: PlanoCatalogo }) {
  return (
    <li className={`flex flex-col rounded-[var(--radius-control)] border p-5 ${plano.destaque ? 'border-[#55bfff]/60 bg-[#55bfff]/[0.06]' : 'border-line bg-raised/60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="tecnica text-mineral-dim">{plano.nivel}</span>
        {plano.destaque ? <span className="tecnica text-[#8bddff]">Mais escolhido</span> : null}
      </div>
      <h3 className="mt-3 text-xl leading-tight tracking-[-0.02em]">{plano.nome}</h3>
      <p className="mt-4 tabular-nums">
        {/* A linha existe sempre, para os preços ficarem alinhados entre os cartões. */}
        <span className="block text-xs text-mineral">{plano.aPartir ? 'a partir de' : ' '}</span>
        <span className="text-[2rem] leading-none tracking-[-0.03em]">{reais(plano.preco)}</span>
        {plano.unidade ? <span className="text-mineral">{plano.unidade}</span> : null}
      </p>
      <p className="mt-2 text-sm text-[#8bddff]">{plano.prazo}</p>
      <ul className="mt-4 space-y-1.5 text-sm leading-snug text-mineral">
        {plano.itens.map((item) => (
          <li key={item} className="flex gap-2"><span aria-hidden="true" className="text-mineral-dim">–</span>{item}</li>
        ))}
      </ul>
      <div className="mt-auto pt-5">
        <Link href={linkDoPlano(id, servico, plano)} className="alvo-toque tecnica inline-flex items-center gap-2 text-[#8bddff] transition-colors hover:text-paper">
          Pedir este plano<span className="sr-only">: {plano.nome}</span> <span aria-hidden="true">→</span>
        </Link>
      </div>
    </li>
  );
}

function Servico({ id, servico }: { id: ServicoId; servico: ServicoCatalogo }) {
  const titulo = `valores-${id}-titulo`;
  const linha = 'flex items-baseline justify-between gap-4 border-t border-line py-2.5 first:border-t-0';
  return (
    <section id={`valores-${id}`} aria-labelledby={titulo} className="scroll-mt-24 border-t border-line pt-10 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
        <div>
          <p className="tecnica text-[#8bddff]">{servico.numero} / {servico.rotulo}</p>
          <h2 id={titulo} className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.045em]">{servico.nome}</h2>
        </div>
        <p className="text-mineral">{DESCRICAO_CURTA[id]}</p>
      </div>

      <ul className={`mt-7 grid gap-3 sm:grid-cols-2 ${servico.planos.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {servico.planos.map((plano) => <Plano key={plano.id} id={id} servico={servico} plano={plano} />)}
      </ul>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {servico.mensais.length ? (
          <div className="rounded-[var(--radius-control)] border border-line p-5">
            <h3 className="tecnica text-mineral-dim">Planos mensais</h3>
            <dl className="mt-3 text-sm">
              {servico.mensais.map((m) => (
                <div key={m.id} className={linha}>
                  <dt>{m.nome}<span className="mt-0.5 block text-xs text-mineral">{m.descricao}</span></dt>
                  <dd className="shrink-0 tabular-nums">{reais(m.preco)}<span className="text-mineral">{m.unidade}</span></dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
        {servico.adicionais.length ? (
          <div className={`rounded-[var(--radius-control)] border border-line p-5 ${servico.mensais.length ? '' : 'lg:col-span-2'}`}>
            <h3 className="tecnica text-mineral-dim">Adicionais</h3>
            <dl className={`mt-3 text-sm ${servico.mensais.length ? '' : 'sm:grid sm:grid-cols-2 sm:gap-x-10 sm:[&>div:nth-child(2)]:border-t-0'}`}>
              {servico.adicionais.map((a) => (
                <div key={a.id} className={linha}>
                  <dt>{a.nome}</dt>
                  <dd className="shrink-0 text-right tabular-nums">{precoDoAdicional(a)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

type Busca = { ideia?: string | string[]; tipo?: string | string[] };

export default async function CrieSeuProjetoPage({ searchParams }: { searchParams: Promise<Busca> }) {
  const query = await searchParams;
  const ideiaInicial = typeof query.ideia === 'string' ? query.ideia.slice(0, 600) : '';
  const tipoInicial: TipoDeProjeto = TIPOS_DE_PROJETO.find((t) => t === query.tipo) ?? 'Ainda não sei';
  // Os valores salvos no painel; se o banco não responder, os do kit comercial.
  const catalogo = await carregarCatalogo().catch(() => catalogoVigente());
  const servicos = catalogo.servicos;

  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,6rem)]">
        <LabBackdrop lado="esquerda" />
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-9">
              <p className="tecnica text-[#8bddff]">{projetoPersonalizado.eyebrow}</p>
              <h1 className="mt-6 max-w-[14ch] text-[clamp(2.8rem,7vw,6rem)] leading-[0.92] tracking-[-0.06em]">
                {projetoPersonalizado.titulo}
              </h1>
              <p className="medida-texto mt-6 text-[1.08rem] leading-relaxed text-mineral">{projetoPersonalizado.descricao}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#valores" className={`${botao} bg-[#55bfff] text-ink hover:bg-[#8bddff]`}>Ver valores ↓</a>
                <a href={ROTA_DO_CATALOGO} className={`${botao} border border-line-strong text-paper hover:border-[#55bfff] hover:text-[#8bddff]`}>
                  Baixar catálogo (PDF)
                </a>
                <a href="#comecar" className={`${botao} border border-line-strong text-paper hover:border-[#55bfff] hover:text-[#8bddff]`}>
                  Pedir orçamento
                </a>
              </div>
            </div>
            <div className="hidden justify-end lg:col-span-3 lg:flex">
              <AppliedEngineeringIcon className="!w-[clamp(8rem,14vw,12rem)]" />
            </div>
          </div>

          <nav aria-label="Serviços e valores iniciais" className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
            {SERVICOS_IDS.map((id) => {
              const inicial = planoInicial(servicos[id]);
              return (
                <a key={id} href={`#valores-${id}`} className="group bg-surface p-5 transition-colors hover:bg-raised">
                  <span className="block text-lg tracking-[-0.02em] group-hover:text-[#8bddff]">{servicos[id].nome}</span>
                  <span className="mt-1 block text-sm text-mineral">
                    a partir de <span className="tabular-nums text-paper">{reais(inicial.preco)}{inicial.unidade}</span>
                  </span>
                </a>
              );
            })}
          </nav>
        </Container>
      </header>

      <Section id="valores" indice="01 / VALORES" rotulo="Valores" className="scroll-mt-16">
        <div className="grid gap-14">
          {SERVICOS_IDS.map((id) => <Servico key={id} id={id} servico={servicos[id]} />)}
        </div>
        <p className="medida-texto mt-10 text-xs leading-relaxed text-mineral-dim">
          Valores de referência válidos até {catalogo.validade}. O valor final depende do escopo e é confirmado na proposta e no
          contrato. Não incluem custos de terceiros (domínio, hospedagem, lojas de aplicativos, licenças e APIs), que ficam em nome do
          cliente. <a href={ROTA_DO_CATALOGO} className="underline underline-offset-4 hover:text-paper">Baixar o catálogo completo (PDF)</a>.
        </p>
      </Section>

      <Section indice="02 / COMO CONTRATAR" rotuladaPor="contratar-titulo">
        <h2 id="contratar-titulo" className="sr-only">Como contratar</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {projetoPersonalizado.contratar.map(([indice, titulo, texto]) => (
            <li key={indice} className="rounded-[var(--radius-control)] border border-line bg-raised/65 p-5">
              <div className="flex items-center gap-4"><span className="tecnica text-[#8bddff]">{indice}</span><h3 className="text-lg tracking-tight">{titulo}</h3></div>
              <p className="mt-3 text-sm leading-relaxed text-mineral">{texto}</p>
            </li>
          ))}
        </ol>
        <ul className="mt-5 flex flex-wrap gap-2">
          {projetoPersonalizado.garantias.map((g) => (
            <li key={g} className="rounded-full border border-line-strong px-4 py-2 text-sm text-mineral">{g}</li>
          ))}
        </ul>
      </Section>

      <Section indice="03 / ORÇAMENTO" className="pb-[clamp(4rem,9vw,9rem)]" rotulo="Pedir orçamento">
        {/* A chave remonta o formulário quando a pessoa escolhe outro plano: os campos voltam preenchidos com ele. */}
        <CustomProjectForm key={`${tipoInicial}|${ideiaInicial}`} ideiaInicial={ideiaInicial} tipoInicial={tipoInicial} />
      </Section>
    </>
  );
}
