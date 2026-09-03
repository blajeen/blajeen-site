import Link from 'next/link';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { SaasCard } from '@/components/projects/SaasCard';
import { saas, saasEmBreve, avisoDemonstracao } from '@/content/saas';
import { ROTAS } from '@/lib/routes';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata = metadadosDaRota({
  titulo: 'SaaS Blajeen Labs — sistemas para o seu negócio',
  descricao: 'Doutelio, Beautelio, Barbelio, Studelio, Foodelio e Lojalio: seis SaaS ativos para organizar seu negócio com sua identidade. Conheça e teste as demonstrações.',
  rota: ROTAS.projetos,
});

export default function Page() {
  return <>
    <section aria-labelledby="catalogo-titulo" className="pt-[clamp(2.5rem,6vw,5rem)] pb-8">
      <Container>
        <p className="tecnica text-signal">SAAS BLAJEEN LABS / 6 PRODUTOS ATIVOS</p>
        <div className="mt-6 grid gap-7 lg:grid-cols-2 lg:items-end">
          <h1 id="catalogo-titulo" className="max-w-[17ch] text-[clamp(2.3rem,5.2vw,4.6rem)] leading-[1.04] tracking-[-0.05em]">Seu negócio.<br />Seu ritmo. Seu SaaS.</h1>
          <div><p className="max-w-[60ch] text-base leading-relaxed text-mineral">Sistemas online para organizar a operação e apresentar sua marca. Escolha o produto para o seu segmento, conheça os recursos e explore uma demonstração antes de começar.</p>
          <p className="mt-4 text-sm leading-relaxed text-mineral">Cada SaaS tem seu próprio site, painel de gestão e opções de configuração. Precisa ir além? A Blajeen Labs também avalia adaptações para a sua necessidade.</p></div>
        </div>
        <nav aria-label="Escolher um SaaS" className="mt-8 flex flex-wrap gap-2">
          {saas.map((produto) => <a key={produto.id} href={`#${produto.id}`} className="alvo-toque inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-mineral hover:border-signal/50 hover:text-paper"><ProductIcon id={produto.icone} className="size-5 shrink-0" />{produto.nome}</a>)}
        </nav>
      </Container>
    </section>
    <Section rotulo="SaaS disponíveis" className="!pt-3">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        {saas.map((produto) => <SaasCard key={produto.id} produto={produto} nivel={2} />)}
      </div>
      <p className="mt-7 max-w-[100ch] text-xs leading-relaxed text-mineral-dim">{avisoDemonstracao}</p>
    </Section>
    <Section indice="GESTÃO E PRÓXIMOS PRODUTOS" rotuladaPor="gestao-titulo" className="!pt-0">
      <TituloSecao id="gestao-titulo">O controle fica com você.</TituloSecao>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="flex flex-col rounded-[var(--radius-panel)] border border-signal/25 bg-raised/70 p-6 sm:p-8">
          <ProductIcon id="admin" className="size-10 text-signal" />
          <p className="tecnica mt-5 text-[10px] text-signal">DISPONÍVEL NOS SAAS</p>
          <h3 className="mt-3 text-2xl leading-tight tracking-tight">Painéis de gestão</h3>
          <p className="mt-4 text-sm leading-relaxed text-mineral">Gerencie a operação e a apresentação do seu negócio no painel do produto contratado. Cada SaaS reúne os módulos e controles do seu segmento.</p>
          <Link href={ROTAS.painelAdministrativo} className="alvo-toque mt-5 inline-flex w-fit items-center text-sm text-signal">Conhecer a gestão dos SaaS →</Link>
        </article>
        <article className="flex flex-col rounded-[var(--radius-panel)] border border-line bg-surface p-6 sm:p-8">
          <ProductIcon id={saasEmBreve.icone} className="size-10 text-mineral" />
          <p className="tecnica mt-5 text-[10px] text-mineral-dim">{saasEmBreve.estado}</p>
          <h3 className="mt-3 text-2xl leading-tight tracking-tight">{saasEmBreve.nome}</h3>
          <p className="mt-4 text-sm leading-relaxed text-mineral">{saasEmBreve.descricao} Ainda não disponível para uso.</p>
          <Link href={saasEmBreve.rota} className="alvo-toque mt-5 inline-flex w-fit items-center text-sm text-paper hover:text-signal">Conhecer a proposta →</Link>
        </article>
      </div>
    </Section>
    <Section rotuladaPor="saas-ajuda" className="!pt-0">
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
        <div><h2 id="saas-ajuda" className="text-2xl tracking-tight">Qual produto combina com a sua operação?</h2><p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-mineral">Conte o que você precisa organizar. Ajudamos a escolher o caminho e a avaliar personalizações.</p></div>
        <Link href={`${ROTAS.contato}#interesse`} className="alvo-toque inline-flex items-center rounded-full bg-signal px-6 py-3 text-sm font-medium text-ink hover:bg-signal-pale">Entre em contato →</Link>
      </div>
    </Section>
  </>;
}
