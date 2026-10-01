import Link from 'next/link';
import { Container, Section } from '@/components/layout/Section';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { SaasCard, SaasStatus } from '@/components/projects/SaasCard';
import { ScreenshotFrame } from '@/components/projects/ScreenshotFrame';
import { avisoDemonstracao, doutelio, espacelio, MODULOS_DO_ESPACELIO, obterSaas, rotaDoModulo, saasEmBreve } from '@/content/saas';
import { ROTAS } from '@/lib/routes';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata = metadadosDaRota({
  titulo: 'SaaS Blajeen Labs — sistemas para o seu negócio',
  descricao: 'Espacelio, o SaaS para barbearias, estética, estúdios, restaurantes e lojas, e Doutelio, para consultórios médicos. Conheça e teste as demonstrações.',
  rota: ROTAS.projetos,
});

/**
 * SaaS Blajeen Labs: dois produtos. O Espacelio reúne os sistemas para negócios locais (com uma
 * seção por módulo na página dele) e o Doutelio segue separado.
 */
export default function Page() {
  return <>
    <section aria-labelledby="catalogo-titulo" className="pb-8 pt-[clamp(2.5rem,6vw,5rem)]">
      <Container>
        <p className="tecnica text-signal">SAAS BLAJEEN LABS / 2 PRODUTOS ATIVOS</p>
        <div className="mt-6 grid gap-7 lg:grid-cols-2 lg:items-end">
          <h1 id="catalogo-titulo" className="max-w-[17ch] text-[clamp(2.3rem,5.2vw,4.6rem)] leading-[1.04] tracking-[-0.05em]">Seu negócio.<br />Seu ritmo. Seu SaaS.</h1>
          <div>
            <p className="max-w-[60ch] text-base leading-relaxed text-mineral">
              Sistemas online para tirar a operação do improviso e apresentar sua marca com clareza. O Espacelio atende
              negócios locais, de barbearias a lojas; o Doutelio, consultórios médicos.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-mineral">Cada um combina uma experiência pública com um painel de gestão para a rotina do negócio.</p>
          </div>
        </div>
      </Container>
    </section>
    <Section rotulo="SaaS disponíveis" className="!pt-3">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <article id="espacelio" className="flex h-full min-w-0 scroll-mt-28 flex-col overflow-hidden rounded-[var(--radius-panel)] border border-signal/30 bg-raised/80">
          <Link href={espacelio.rota} aria-label={`Conhecer ${espacelio.nome}`} className="block border-b border-line bg-surface p-3 sm:p-4">
            <ScreenshotFrame src={obterSaas('barbelio').imagens[0].src} alt="Demonstração do módulo de barbearias do Espacelio." label={espacelio.nome} />
          </Link>
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ProductIcon id={espacelio.icone} className="size-9 shrink-0 text-signal" />
              <SaasStatus />
            </div>
            <p className="tecnica mt-5 text-[10px] text-mineral">{espacelio.segmento}</p>
            <h2 className="mt-2 text-[clamp(1.85rem,3vw,2.6rem)] leading-tight tracking-[-0.04em]">
              <Link href={espacelio.rota} className="transition-colors hover:text-signal">{espacelio.nome}</Link>
            </h2>
            <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-mineral">{espacelio.resumo}</p>
            <ul aria-label="Módulos do Espacelio" className="mt-5 flex flex-wrap gap-2">
              {MODULOS_DO_ESPACELIO.map((m) => (
                <li key={m.ancora}>
                  <Link href={rotaDoModulo(m.ancora)} className="inline-flex min-h-9 items-center rounded-full border border-line px-3 text-xs text-mineral hover:border-signal/50 hover:text-paper">{m.titulo}</Link>
                </li>
              ))}
              <li><Link href={saasEmBreve.rota} className="inline-flex min-h-9 items-center rounded-full border border-line px-3 text-xs text-mineral-dim hover:text-paper">{saasEmBreve.modulo} · em breve</Link></li>
            </ul>
            <div className="mt-auto pt-6">
              <Link href={espacelio.rota} className="alvo-toque inline-flex items-center gap-3 text-sm font-medium text-paper transition-colors hover:text-signal">Conhecer o {espacelio.nome} <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </article>
        <SaasCard produto={doutelio()} nivel={2} />
      </div>
      <p className="mt-7 max-w-[100ch] text-xs leading-relaxed text-mineral-dim">{avisoDemonstracao}</p>
    </Section>
    <Section rotuladaPor="saas-ajuda" className="!pt-0">
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
        <div><h2 id="saas-ajuda" className="text-2xl tracking-tight">Qual produto combina com a sua operação?</h2><p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-mineral">Conte o que você precisa organizar. Ajudamos a escolher o caminho e a avaliar personalizações.</p></div>
        <Link href={`${ROTAS.contato}#interesse`} className="alvo-toque inline-flex items-center rounded-full bg-signal px-6 py-3 text-sm font-medium text-ink hover:bg-signal-pale">Entre em contato →</Link>
      </div>
    </Section>
  </>;
}
