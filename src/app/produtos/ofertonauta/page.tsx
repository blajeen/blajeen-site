import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Section } from '@/components/layout/Section';
import { ofertonauta } from '@/content/ofertonauta';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Ofertonauta — exploradores de promoções | Blajeen Labs',
  descricao: ofertonauta.resumo, rota: ofertonauta.rota,
});

export default function OfertonautaPage() {
  return <>
    <header className="pt-[clamp(3rem,7vw,7rem)]">
      <Container>
        <p className="tecnica text-signal">{ofertonauta.estado}</p>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <h1 className="break-words text-[clamp(2.6rem,7vw,7rem)] leading-[0.98] tracking-[-0.05em]">Ofertonauta</h1>
            <p className="mt-6 text-[clamp(1.4rem,3vw,2.4rem)]">{ofertonauta.lema}</p>
            <p className="medida-texto mt-6 leading-relaxed text-mineral">{ofertonauta.resumo}</p>
            <a href={ofertonauta.site} target="_blank" rel="noreferrer" className="alvo-toque tecnica mt-8 inline-flex items-center rounded-full bg-signal px-6 text-ink hover:bg-glow">ABRIR O RADAR NO SITE ↗</a>
          </div>
          <Image src={ofertonauta.icone.src} alt="Ícone do Ofertonauta: astronauta explorador de ofertas." width={512} height={512} priority sizes="(min-width:1024px) 300px, 200px" className="mx-auto w-48 rounded-[2rem] lg:col-span-4 lg:w-72" />
        </div>
      </Container>
    </header>
    <Section indice="01 / O RADAR" rotulo="Como funciona o Ofertonauta">
      <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {ofertonauta.recursos.map(item => <section key={item.titulo} className="border-t border-line pt-6"><h2 className="text-2xl">{item.titulo}</h2><p className="mt-4 leading-relaxed text-mineral">{item.texto}</p></section>)}
      </div>
    </Section>
    <Section indice="02 / NO CELULAR" rotulo="Aplicativo Ofertonauta">
      <h2 className="text-3xl">Android e iOS em preparação.</h2>
      <p className="medida-texto mt-5 leading-relaxed text-mineral">O aplicativo está em desenvolvimento e preparação para as lojas. Os links de instalação serão publicados aqui quando as fichas estiverem disponíveis. Enquanto isso, você pode consultar o radar pelo site.</p>
    </Section>
    <Section indice="03 / DOCUMENTOS" rotulo="Suporte privacidade termos e exclusão de conta" className="pb-24">
      <h2 className="text-3xl">Suporte, privacidade e sua conta.</h2>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">{ofertonauta.documentos.map(doc => <li key={doc.href}><Link href={doc.href} className="alvo-toque flex items-center justify-between border-b border-line py-4 text-paper hover:text-signal">{doc.rotulo}<span aria-hidden="true">→</span></Link></li>)}</ul>
    </Section>
  </>;
}
