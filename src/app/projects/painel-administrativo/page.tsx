import Link from 'next/link';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { SaasMedia } from '@/components/projects/SaasMedia';
import { obterSaas, avisoDemonstracao } from '@/content/saas';
import { ROTAS } from '@/lib/routes';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata = metadadosDaRota({
  titulo: 'Painéis de gestão dos SaaS | Blajeen Labs',
  descricao: 'Gerencie a operação e a identidade do seu negócio no painel do seu SaaS Blajeen Labs. Conheça exemplos de agenda, planos, marca e canais.',
  rota: ROTAS.painelAdministrativo,
});
const exemplos = [
  { produto: obterSaas('barbelio'), indice: 1 },
  { produto: obterSaas('studelio'), indice: 2 },
  { produto: obterSaas('lojalio'), indice: 1 },
] as const;

export default function Page() {
  return <>
    <section aria-labelledby="painel-titulo" className="pt-[clamp(2.5rem,6vw,5rem)]">
      <Container>
        <Link href={ROTAS.projetos} className="alvo-toque inline-flex items-center text-sm text-mineral hover:text-signal">← Todos os SaaS</Link>
        <div className="mt-6 flex flex-wrap items-center gap-4"><ProductIcon id="admin" className="size-11 text-signal" /><p className="tecnica text-signal">ATIVO / DISPONÍVEL NOS SAAS</p></div>
        <div className="mt-7 grid gap-7 lg:grid-cols-2 lg:items-end">
          <div><p className="tecnica text-mineral">PAINEL ADMINISTRATIVO / BLAJEEN LABS</p><h1 id="painel-titulo" className="mt-4 max-w-[17ch] text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.04] tracking-[-0.045em]">Sua operação e sua marca sob seu controle.</h1></div>
          <div><p className="text-base leading-relaxed text-mineral">Cada SaaS possui um painel de gestão para organizar as informações e as rotinas do seu segmento. É ali que você acompanha a operação e configura a apresentação do seu negócio, conforme os recursos do produto.</p><p className="mt-4 text-sm leading-relaxed text-mineral">O acesso é feito no site do SaaS contratado. Os exemplos abaixo pertencem a produtos diferentes: não representam uma conta única que controla todos os sistemas.</p></div>
        </div>
      </Container>
    </section>
    <Section indice="01 / CONTROLE NO DIA A DIA" rotuladaPor="painel-recursos">
      <TituloSecao id="painel-recursos">O painel acompanha o seu negócio.</TituloSecao>
      <div className="mt-8 grid gap-7 md:grid-cols-3">
        {[['Operação','Agenda, atendimentos, sessões ou pedidos: os controles acompanham o segmento de cada SaaS.'],['Conteúdo','Organize os serviços, modalidades, cardápio ou catálogo disponíveis no produto.'],['Identidade','Configure a marca, as informações do negócio e os canais disponibilizados pelo sistema.']].map(([titulo,texto]) => <div key={titulo} className="border-t border-line pt-5"><h3 className="text-xl tracking-tight">{titulo}</h3><p className="mt-3 text-sm leading-relaxed text-mineral">{texto}</p></div>)}
      </div>
    </Section>
    <Section indice="02 / EXEMPLOS DOS PRODUTOS" rotulo="Três exemplos dos painéis de gestão" className="!pt-0">
      <div className="grid gap-8 lg:grid-cols-2">
        {exemplos.map(({produto,indice}) => <div key={produto.id}><p className="tecnica mb-3 text-signal">{produto.nome}</p><SaasMedia imagem={produto.imagens[indice]} /><Link href={produto.rota} className="alvo-toque mt-3 inline-flex items-center text-sm text-signal">Conhecer {produto.nome} →</Link></div>)}
        <div className="flex flex-col justify-center rounded-[var(--radius-panel)] border border-line bg-raised/70 p-6 sm:p-9"><h2 className="max-w-[20ch] text-3xl leading-tight tracking-tight">Escolha o sistema. Conheça os controles.</h2><p className="mt-5 text-sm leading-relaxed text-mineral">Os recursos variam por produto e pelas condições de contratação. Consulte a apresentação e a demonstração do SaaS para avaliar sua rotina.</p><Link href={ROTAS.projetos} className="alvo-toque mt-6 inline-flex w-fit items-center text-sm text-signal">Explorar os SaaS disponíveis →</Link></div>
      </div>
      <p className="mt-8 max-w-[100ch] text-xs leading-relaxed text-mineral-dim">{avisoDemonstracao}</p>
    </Section>
  </>;
}
