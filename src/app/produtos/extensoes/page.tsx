import type { Metadata } from 'next';
import Image from 'next/image';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { ProductTabs } from '@/components/projects/ProductTabs';
import { ScreenshotFrame } from '@/components/projects/ScreenshotFrame';
import { estadoDaExtensao, extensoes } from '@/content/extensoes';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Extensões open source — Blajeen Labs',
  descricao: 'Growlio, Findlio, Grammarlio, Taskelio e Scopelio: cinco extensões gratuitas e open source para Chrome e Edge, com código, instruções e privacidade à vista.',
  rota: ROTAS.extensoes,
});

export default function ExtensoesPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">PRODUTOS / EXTENSÕES OPEN SOURCE</p>
          <h1 className="mt-8 max-w-[15ch] text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em]">Pequenas ferramentas. Mais possibilidades.</h1>
          <p className="medida-texto mt-7 text-[1.05rem] leading-relaxed text-mineral">Cinco extensões gratuitas para Chrome e Edge. Para encontrar, revisar, destacar, contar e dar forma ao seu dia. Código aberto sob licença MIT, sem conta na extensão e sem assinatura.</p>
          <ProductTabs atual="extensoes" />
        </Container>
      </header>
      <Section indice="01 / CÓDIGO ABERTO" rotulo="Extensões do laboratório" className="pb-[clamp(4rem,9vw,9rem)]">
        <div className="mb-10 max-w-3xl border-l border-signal pl-5 text-sm leading-relaxed text-mineral">
          <p>As versões atuais podem ser instaladas manualmente pelo GitHub. Taskelio e Scopelio estão em análise para publicação pública na Chrome Web Store; Growlio, Findlio e Grammarlio são distribuídos pelo GitHub. O envio para análise ainda não significa aprovação ou disponibilidade na loja.</p>
          <p className="mt-3">As configurações ficam em cada dispositivo. Usar a mesma conta Google não leva automaticamente regras, filtros ou tarefas para outro computador. No Findlio, as buscas fazem requisições ao site pesquisado. No Grammarlio, ativar a IA baixa os dados do modelo; a revisão do texto permanece local.</p>
        </div>
        <div className="grid gap-7">
          {extensoes.map((extensao, indice) => (
            <article id={extensao.id} key={extensao.id} className="scroll-mt-28 rounded-[var(--radius-panel)] border border-line bg-raised/60 p-6 sm:p-9">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="min-w-0 lg:col-span-6">
                  <ScreenshotFrame src={extensao.imagem} alt={extensao.imagemAlt} label={extensao.nome} priority={indice === 0} original />
                </div>
                <div className="lg:col-span-6 lg:pl-3">
                  <div className="flex items-center gap-3">
                    <Image src={`/produtos/extensoes/icons/${extensao.id}.png`} alt="" width={44} height={44} className="rounded-xl" />
                    <span className="tecnica text-signal">OPEN SOURCE · MIT · {extensao.versao}</span>
                  </div>
                  <h2 className="mt-5 text-[clamp(2rem,4vw,3.3rem)] leading-none tracking-[-0.05em]">{extensao.nome}</h2>
                  <p className="mt-3 text-lg text-paper/90">{extensao.lema}</p>
                  <p className="medida-texto mt-5 text-sm leading-relaxed text-mineral">{extensao.resumo}</p>
                  <p className="mt-4 text-xs leading-relaxed text-mineral">{extensao.limite}</p>
                  <p className="tecnica mt-5 text-signal">{estadoDaExtensao(extensao.loja)}</p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
                    <a href={extensao.repositorio} target="_blank" rel="noreferrer" className="alvo-toque tecnica inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow">CÓDIGO E INSTALAÇÃO ↗</a>
                    <a href={extensao.privacidade} target="_blank" rel="noreferrer" className="alvo-toque inline-flex items-center text-sm text-mineral underline underline-offset-4 hover:text-paper">Privacidade ↗</a>
                    <a href={`${extensao.repositorio}/issues`} target="_blank" rel="noreferrer" className="alvo-toque inline-flex items-center text-sm text-mineral underline underline-offset-4 hover:text-paper">Suporte ↗</a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
