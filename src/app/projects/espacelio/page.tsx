import Link from 'next/link';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { SaasStatus } from '@/components/projects/SaasCard';
import { SaasMedia } from '@/components/projects/SaasMedia';
import { ScreenshotFrame } from '@/components/projects/ScreenshotFrame';
import { avisoDemonstracao, espacelio, MODULOS_DO_ESPACELIO, obterSaas, saasEmBreve } from '@/content/saas';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata = metadadosDaRota({
  titulo: 'Espacelio — SaaS para negócios locais | Blajeen Labs',
  descricao: 'Barbearias, estética, estúdios, restaurantes e lojas num SaaS só: site com a sua marca, agenda ou pedidos e um painel para a rotina. Conheça os módulos e teste as demonstrações.',
  rota: ROTAS.espacelio,
  imagem: obterSaas('barbelio').imagens[0].src,
  imagemAlt: 'Demonstração de um módulo do Espacelio.',
});

const modulos = MODULOS_DO_ESPACELIO.map((m) => ({ ...m, produto: obterSaas(m.id) }));

/** Exemplos dos painéis: cada um é de um módulo diferente, não uma conta única que controla todos. */
const paineis = [
  { produto: obterSaas('barbelio'), indice: 1 },
  { produto: obterSaas('studelio'), indice: 2 },
  { produto: obterSaas('lojalio'), indice: 2 },
] as const;

/**
 * Espacelio: os sistemas para negócios locais, resumidos numa página só (pedido do titular). Cada
 * módulo tem uma seção com âncora; os endereços antigos de cada sistema redirecionam para ela.
 */
export default function EspacelioPage() {
  return <>
    <section aria-labelledby="espacelio-titulo" className="pb-6 pt-[clamp(2.5rem,6vw,5rem)]">
      <Container>
        <Link href={ROTAS.projetos} className="alvo-toque inline-flex items-center text-sm text-mineral hover:text-signal">← SaaS Blajeen Labs</Link>
        <div className="mt-6 flex flex-wrap items-center gap-4"><ProductIcon id={espacelio.icone} className="size-11 text-signal" /><SaasStatus /></div>
        <div className="mt-6 grid gap-7 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="tecnica text-mineral">SAAS BLAJEEN LABS / {espacelio.segmento.toUpperCase()}</p>
            <h1 id="espacelio-titulo" className="mt-4 text-[clamp(2.8rem,7vw,6rem)] leading-[0.95] tracking-[-0.055em]">{espacelio.nome}</h1>
            <p className="mt-4 max-w-[22ch] text-[clamp(1.4rem,2.6vw,2rem)] leading-tight tracking-[-0.03em] text-paper/85">{espacelio.titulo}</p>
          </div>
          <p className="max-w-[60ch] text-base leading-relaxed text-mineral">{espacelio.descricao}</p>
        </div>
        <nav aria-label="Módulos do Espacelio" className="mt-8 flex flex-wrap gap-2">
          {modulos.map((m) => (
            <a key={m.ancora} href={`#${m.ancora}`} className="alvo-toque inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-mineral hover:border-signal/50 hover:text-paper">
              <ProductIcon id={m.produto.icone} className="size-5 shrink-0" />{m.titulo}
            </a>
          ))}
          <a href="#crm" className="alvo-toque inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-mineral-dim hover:text-paper">
            <ProductIcon id={saasEmBreve.icone} className="size-5 shrink-0" />{saasEmBreve.modulo} · em breve
          </a>
          <a href="#paineis" className="alvo-toque inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-mineral hover:text-paper">
            <ProductIcon id="admin" className="size-5 shrink-0" />Painéis de gestão
          </a>
        </nav>
      </Container>
    </section>

    <Section indice="01 / UM SAAS, VÁRIOS NEGÓCIOS" rotulo="Módulos do Espacelio" className="!pt-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {modulos.map(({ ancora, titulo, produto }) => (
          <article key={ancora} id={ancora} className="flex min-w-0 scroll-mt-28 flex-col overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/80">
            <a href={produto.demo} target="_blank" rel="noopener noreferrer" aria-label={`Abrir a demonstração de ${titulo} (nova aba)`} className="block border-b border-line bg-surface p-3 sm:p-4">
              <ScreenshotFrame src={produto.imagens[0].src} alt={produto.imagens[0].descricao} label={produto.nomeDemo} />
            </a>
            <div className="flex flex-1 flex-col p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <ProductIcon id={produto.icone} className="size-8 shrink-0 text-signal" />
                <p className="tecnica text-[10px] text-mineral">MÓDULO · ANTES {produto.nome.toUpperCase()}</p>
              </div>
              <h2 className="mt-4 text-[clamp(1.7rem,2.8vw,2.3rem)] leading-tight tracking-[-0.04em]">{titulo}</h2>
              <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-mineral">{produto.resumo}</p>
              <ul className="mt-5 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
                {produto.recursos.map((r) => (
                  <li key={r.titulo} className="flex gap-2"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />{r.titulo}</li>
                ))}
              </ul>
              {produto.observacao ? <p className="mt-4 text-xs leading-relaxed text-mineral-dim">{produto.observacao}</p> : null}
              <div className="mt-auto flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-sm">
                <a href={produto.demo} target="_blank" rel="noopener noreferrer" className="alvo-toque inline-flex items-center text-paper hover:text-signal">Testar a demonstração ↗</a>
                {produto.formulario ? <Link href={`/projects/${produto.formulario}/formulario`} className="alvo-toque inline-flex items-center text-mineral hover:text-signal">Preencher briefing →</Link> : null}
                <Link href={`${ROTAS.contato}?produto=${produto.contato}#interesse`} className="alvo-toque inline-flex items-center text-mineral hover:text-signal">Conversar sobre este módulo →</Link>
              </div>
            </div>
          </article>
        ))}
        <article id="crm" className="flex scroll-mt-28 flex-col rounded-[var(--radius-panel)] border border-line bg-surface p-6 sm:p-8">
          <ProductIcon id={saasEmBreve.icone} className="size-10 text-mineral" />
          <p className="tecnica mt-5 text-[10px] text-mineral-dim">MÓDULO · ANTES {saasEmBreve.nome.toUpperCase()} · {saasEmBreve.estado}</p>
          <h2 className="mt-3 text-[clamp(1.7rem,2.8vw,2.3rem)] leading-tight tracking-[-0.04em]">{saasEmBreve.modulo}</h2>
          <p className="mt-3 text-sm leading-relaxed text-mineral">{saasEmBreve.descricao} Ainda não disponível para uso.</p>
          <Link href={`${ROTAS.contato}?produto=pipelio#interesse`} className="alvo-toque mt-auto inline-flex w-fit items-center pt-5 text-sm text-paper hover:text-signal">Tenho interesse no CRM →</Link>
        </article>
      </div>
      <p className="mt-7 max-w-[100ch] text-xs leading-relaxed text-mineral-dim">{avisoDemonstracao}</p>
    </Section>

    <Section indice="02 / PAINÉIS DE GESTÃO" rotuladaPor="paineis-titulo" id="paineis" className="scroll-mt-20 !pt-0">
      <TituloSecao id="paineis-titulo">O painel acompanha o seu negócio.</TituloSecao>
      <div className="mt-8 grid gap-7 md:grid-cols-3">
        {[
          ['Operação', 'Agenda, atendimentos, sessões ou pedidos: os controles acompanham o segmento de cada módulo.'],
          ['Conteúdo', 'Organize os serviços, modalidades, cardápio ou catálogo disponíveis no módulo.'],
          ['Identidade', 'Configure a marca, as informações do negócio e os canais disponibilizados pelo sistema.'],
        ].map(([titulo, texto]) => (
          <div key={titulo} className="border-t border-line pt-5"><h3 className="text-xl tracking-tight">{titulo}</h3><p className="mt-3 text-sm leading-relaxed text-mineral">{texto}</p></div>
        ))}
      </div>
      <p className="mt-8 max-w-[70ch] text-sm leading-relaxed text-mineral">
        O acesso é feito no site do módulo contratado. Os exemplos abaixo vêm de módulos diferentes: não representam uma conta única que controla todos os segmentos.
      </p>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {paineis.map(({ produto, indice }) => <SaasMedia key={`${produto.id}-${indice}`} imagem={produto.imagens[indice]} />)}
      </div>
    </Section>

    <Section rotuladaPor="espacelio-ajuda" className="!pt-0">
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
        <div><h2 id="espacelio-ajuda" className="text-2xl tracking-tight">Qual módulo combina com a sua operação?</h2><p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-mineral">Conte o que você precisa organizar. Ajudamos a escolher o caminho e a avaliar personalizações.</p></div>
        <Link href={`${ROTAS.contato}#interesse`} className="alvo-toque inline-flex items-center rounded-full bg-signal px-6 py-3 text-sm font-medium text-ink hover:bg-signal-pale">Entre em contato →</Link>
      </div>
    </Section>
  </>;
}
