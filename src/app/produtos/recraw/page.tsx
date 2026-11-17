import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { SystemScreenshot } from '@/components/media/SystemScreenshot';
import { ConferirArquivo } from '@/components/produtos/ConferirArquivo';
import { recraw, RECRAW_DOWNLOAD, RECRAW_RELEASES } from '@/content/recraw';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Recraw — grave áudio, tela e ideias | Blajeen Labs',
  descricao: 'Grave sua voz e o som do computador, capture a tela inteira e anote em um quadro com imagens e recorte. Recraw para Windows, gratuito e com arquivos locais.',
  rota: ROTAS.produtoRecraw,
  imagem: '/produtos/recraw/recraw-social.jpg',
  imagemAlt: 'Recraw — áudio, tela e ideias. Programa para Windows da Blajeen Labs.',
});

export default function RecrawPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">{recraw.estado} / WINDOWS</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end [&>*]:min-w-0">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-5 sm:gap-7">
                <Image src="/produtos/recraw/recraw-icon.png" alt="" width={96} height={96} priority className="size-16 rounded-2xl sm:size-24" />
                <h1 className="text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em]">Recraw</h1>
              </div>
              <p className="mt-7 max-w-[26ch] text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.12] tracking-[-0.03em] text-paper/85">{recraw.lema}</p>
            </div>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10 lg:pb-2">{recraw.resumo}</p>
          </div>
          <div className="tecnica mt-8 flex flex-wrap gap-x-6 gap-y-3 text-mineral">
            <span>ÁUDIO + TELA + QUADRO</span><span>SEM CONTA</span><span>ARQUIVOS LOCAIS</span>
          </div>
        </Container>
      </header>

      <Section id="baixar" indice="01 / BAIXAR" rotulo="Baixar o Recraw">
        <div className="grid gap-4 md:grid-cols-2">
          {recraw.arquivos.map((arquivo) => (
            <article key={arquivo.id} className={`flex flex-col rounded-[var(--radius-panel)] border p-6 sm:p-8 ${arquivo.recomendado ? 'border-signal/40 bg-raised/80' : 'border-line bg-raised/50'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-[1.6rem] leading-none tracking-[-0.03em]">{arquivo.nome}</h2>
                {arquivo.recomendado ? <span className="tecnica text-signal">RECOMENDADO</span> : null}
              </div>
              <p className="mt-4 max-w-[50ch] flex-1 text-sm leading-relaxed text-mineral">{arquivo.paraQuem}</p>
              <a href={`${RECRAW_DOWNLOAD}/${arquivo.arquivo}`} aria-label={`Baixar ${arquivo.nome.toLowerCase()} do Recraw — ${arquivo.tamanho}`} className={`alvo-toque tecnica mt-7 inline-flex items-center justify-center rounded-full px-5 ${arquivo.recomendado ? 'bg-signal text-ink hover:bg-glow' : 'border border-line-strong text-paper hover:border-signal/40'}`}>
                BAIXAR {arquivo.recomendado ? 'INSTALADOR' : 'PORTÁTIL'} · {arquivo.tamanho} <span aria-hidden="true" className="ml-3">↓</span>
              </a>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-mineral-dim">Versão {recraw.versao} · {recraw.requisitos}. Uso diário offline. A preparação inicial do WebView2 pode precisar de internet.</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-mineral">
          <a href={`${RECRAW_DOWNLOAD}/Recraw-0.1.1-leia-me.txt`} className="underline decoration-line-strong underline-offset-4 hover:text-paper">Guia de uso</a>
          <a href={RECRAW_RELEASES} className="underline decoration-line-strong underline-offset-4 hover:text-paper">Histórico de versões</a>
          <Link href={ROTAS.suporte} className="underline decoration-line-strong underline-offset-4 hover:text-paper">Precisa de ajuda?</Link>
        </div>
        <p className="medida-texto mt-7 text-sm leading-relaxed text-mineral">{recraw.avisoDoWindows.porque}</p>
        <ConferirArquivo arquivos={recraw.arquivos} produto={recraw.nome} versao={recraw.versao} />
      </Section>

      <Section indice="02 / TRÊS JEITOS DE GUARDAR" rotulo="Áudio, tela e quadro">
        <figure>
          <SystemScreenshot src={recraw.imagem.src} alt={recraw.imagem.alt} sizes="(max-width: 1280px) 92vw, 1180px" largura={1160} altura={790} label="RECRAW / ÁUDIO" />
          <figcaption className="mt-3 text-xs leading-relaxed text-mineral-dim">{recraw.imagem.legenda}</figcaption>
        </figure>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {recraw.faz.map((item, indice) => (
            <article key={item.titulo} className="border-t border-line pt-6">
              <p aria-hidden="true" className="tecnica text-signal">0{indice + 1}</p>
              <h2 className="mt-4 text-xl tracking-[-0.03em]">{item.titulo}</h2>
              <p className="mt-3 text-sm leading-relaxed text-mineral">{item.texto}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section indice="03 / ESPAÇO PARA EXPLICAR" rotulo="Quadro de anotações com imagens">
        <div className="mb-9 grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2 className="max-w-[18ch] text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.045em]">Cole uma referência.<br />Desenhe por cima.</h2>
          <p className="medida-texto text-mineral leading-relaxed">Cole com Ctrl+V ou arraste uma imagem. Recorte, gire, duplique e organize no quadro. O salvamento é automático e você pode continuar anotando enquanto grava.</p>
        </div>
        <figure>
          <SystemScreenshot src="/produtos/recraw/recraw-quadro.webp" alt="Quadro real do Recraw em tema escuro, com uma imagem de exemplo selecionada e ferramentas para recortar, girar e duplicar." sizes="(max-width: 1280px) 92vw, 1180px" largura={1160} altura={790} label="RECRAW / QUADRO COM IMAGEM DE EXEMPLO" />
          <figcaption className="mt-3 text-xs leading-relaxed text-mineral-dim">Quadro do Recraw com uma imagem de exemplo. Temas claro e escuro disponíveis no botão do canto superior direito.</figcaption>
        </figure>
      </Section>

      <Section indice="04 / PARA COMEÇAR" rotulo="Como usar o Recraw">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(1.8rem,3vw,2.7rem)] leading-[1.08] tracking-[-0.04em]">Uma sessão,<br />seus arquivos.</h2>
            <p className="medida-texto mt-5 text-sm leading-relaxed text-mineral">Escolha Áudio, Tela ou Quadro na lateral. As sessões ficam em pastas no seu computador, inicialmente em Documentos\Recraw. Você pode mudar o destino nos ajustes.</p>
            <p className="medida-texto mt-4 text-sm leading-relaxed text-mineral">Antes de uma reunião, escolha o microfone e a saída de som e use “Testar 5 segundos”. Ouça o resultado para conferir as duas fontes. Fones ajudam a evitar que o microfone capte o som dos alto-falantes novamente.</p>
            <p className="medida-texto mt-4 text-sm leading-relaxed text-mineral">O áudio usa cerca de 29 MB por hora. O vídeo padrão com áudio tem referência de 480 MB por hora. São estimativas: o tamanho real depende do conteúdo e do codificador.</p>
          </div>
          <div className="rounded-[var(--radius-panel)] border border-line bg-raised/50 p-6 sm:p-8">
            <h2 className="text-xl tracking-[-0.03em]">Sobre esta versão</h2>
            <ul className="mt-5 space-y-5 text-sm leading-relaxed text-mineral">
              {recraw.naoFaz.map((texto) => <li key={texto} className="border-t border-line pt-4">{texto}</li>)}
            </ul>
          </div>
        </div>
        <a href="#baixar" className="alvo-toque tecnica mt-10 inline-flex items-center rounded-full border border-line-strong px-6 text-paper hover:border-signal/40">VOLTAR AOS DOWNLOADS <span aria-hidden="true" className="ml-4">↑</span></a>
      </Section>
    </>
  );
}
