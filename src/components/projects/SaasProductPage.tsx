import Link from 'next/link';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { avisoDemonstracao, type SaasProduct } from '@/content/saas';
import { ROTAS } from '@/lib/routes';
import { metadadosDaRota } from '@/lib/metadata';
import { ProductIcon } from './ProductIcon';
import { ProjectFormCard } from './ProjectFormCard';
import { SaasMedia } from './SaasMedia';
import { SaasStatus } from './SaasCard';

export function metadadosSaas(produto: SaasProduct) {
  return metadadosDaRota({ titulo: `${produto.nome} — ${produto.segmento} | Blajeen Labs`,
    descricao: produto.resumo, rota: produto.rota, imagem: produto.imagens[0].src,
    imagemAlt: produto.imagens[0].descricao });
}

export function SaasProductPage({ produto }: { produto: SaasProduct }) {
  return <>
    <section aria-labelledby="saas-titulo" className="pt-[clamp(2rem,5vw,4rem)] pb-6">
      <Container>
        <Link href={ROTAS.projetos} className="alvo-toque inline-flex items-center text-sm text-mineral hover:text-signal">← Todos os SaaS</Link>
        <div className="mt-7 grid min-w-0 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center xl:gap-12">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-4"><ProductIcon id={produto.icone} className="size-10 shrink-0 text-signal" /><SaasStatus /></div>
            <p className="tecnica mt-6 text-mineral">{produto.segmento}</p>
            <h1 id="saas-titulo" className="mt-3 text-[clamp(2.4rem,5.5vw,4.8rem)] leading-none tracking-[-0.05em]">{produto.nome}</h1>
            <p className="mt-5 max-w-[25ch] text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.15] tracking-[-0.035em]">{produto.titulo}</p>
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-mineral">{produto.descricao}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={produto.site} target="_blank" rel="noopener noreferrer" aria-label={`Acessar ${produto.nome} (nova aba)`}
                className="alvo-toque inline-flex items-center justify-center rounded-full bg-signal px-5 py-3 text-center text-sm font-medium text-ink transition-colors hover:bg-signal-pale">Acessar {produto.nome} ↗</a>
              <a href={produto.demo} target="_blank" rel="noopener noreferrer" aria-label={`Abrir demonstração de ${produto.nome} (nova aba)`}
                className="alvo-toque inline-flex items-center justify-center rounded-full border border-line-strong px-5 py-3 text-center text-sm text-paper transition-colors hover:border-signal hover:text-signal">Abrir demonstração ↗</a>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-mineral-dim">Planos, preços e condições atualizados no site do produto.</p>
          </div>
          <SaasMedia imagem={produto.imagens[0]} prioridade />
        </div>
      </Container>
    </section>

    <Section indice="01 / PARA QUEM É" rotuladaPor="saas-publico">
      <div className="grid gap-6 border-y border-line py-7 lg:grid-cols-[0.85fr_1.15fr] xl:gap-12">
        <TituloSecao id="saas-publico" className="!text-[clamp(1.7rem,3vw,2.5rem)]">Feito para a sua rotina.</TituloSecao>
        <p className="max-w-[66ch] text-base leading-relaxed text-mineral">{produto.publico}</p>
      </div>
      <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2 xl:grid-cols-4">
        {produto.recursos.map((recurso, i) => <div key={recurso.titulo} className="min-w-0">
          <p className="tecnica text-signal">0{i + 1}</p>
          <h3 className="mt-3 text-xl leading-snug tracking-tight">{recurso.titulo}</h3>
          <p className="mt-3 text-sm leading-relaxed text-mineral">{recurso.texto}</p>
        </div>)}
      </div>
      {produto.observacao && <p className="mt-8 max-w-[90ch] border-l-2 border-signal/50 pl-4 text-sm leading-relaxed text-mineral">{produto.observacao}</p>}
    </Section>

    <Section indice="02 / POR DENTRO DO PRODUTO" rotuladaPor="saas-telas" className="!pt-0">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div><TituloSecao id="saas-telas">Veja o produto em uso.</TituloSecao><p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-mineral">Uma visão rápida da experiência pública e dos controles que apoiam a rotina do seu negócio.</p></div>
        <a href={produto.site} target="_blank" rel="noopener noreferrer" className="alvo-toque inline-flex items-center gap-2 text-sm text-signal">Ver apresentação completa no {produto.nome} ↗</a>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {produto.imagens.slice(1).map((imagem) => <SaasMedia key={imagem.src} imagem={imagem} />)}
      </div>
      <p className="mt-8 max-w-[100ch] text-xs leading-relaxed text-mineral-dim">{avisoDemonstracao}</p>
      <a href={produto.demo} target="_blank" rel="noopener noreferrer" className="alvo-toque mt-4 inline-flex items-center text-sm text-signal">Explore a demo: {produto.nomeDemo} ↗</a>
    </Section>

    <Section indice="03 / SUA IDENTIDADE" rotuladaPor="saas-identidade" className="!pt-0">
      <div className="grid gap-7 rounded-[var(--radius-panel)] border border-line bg-raised/70 p-6 sm:p-9 lg:grid-cols-2 lg:items-center">
        <div><TituloSecao id="saas-identidade" className="!text-[clamp(1.7rem,3vw,2.5rem)]">O sistema é nosso. A identidade é sua.</TituloSecao>
          <p className="mt-5 max-w-[60ch] text-sm leading-relaxed text-mineral">Apresente seu negócio com sua marca, seus conteúdos e seus serviços ou produtos. O painel de gestão reúne os controles disponíveis em cada SaaS.</p></div>
        <div className="min-w-0"><p className="max-w-[58ch] text-sm leading-relaxed text-mineral">Precisa de uma adaptação específica? Conte sua necessidade à Blajeen Labs. Avaliamos o escopo, as possibilidades e as condições antes de começar.</p>
          <Link href={`${ROTAS.contato}?produto=${produto.contato}#interesse`} className="alvo-toque mt-5 inline-flex items-center gap-3 text-sm font-medium text-signal">Conversar sobre {produto.nome} <span aria-hidden="true">→</span></Link>
          <Link href={ROTAS.painelAdministrativo} className="alvo-toque mt-1 flex w-fit items-center text-sm text-mineral hover:text-paper">Conhecer os painéis de gestão →</Link></div>
      </div>
    </Section>
    {produto.formulario && <Section indice="04 / JÁ CONVERSOU COM A EQUIPE?" rotulo="Briefing de personalização" className="!pt-0"><ProjectFormCard slug={produto.formulario} /></Section>}
  </>;
}
