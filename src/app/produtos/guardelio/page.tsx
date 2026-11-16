import type { Metadata } from 'next';
import Image from 'next/image';
import { Container, Section } from '@/components/layout/Section';
import { guardelio } from '@/content/guardelio';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Guardelio — proteção gerenciada para mídia paga | Blajeen Labs',
  descricao: guardelio.resumo, rota: guardelio.rota,
});

export default function GuardelioPage() {
  return <>
    <header className="pt-[clamp(3rem,7vw,7rem)]">
      <Container>
        <p className="tecnica text-signal">{guardelio.estado}</p>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <h1 className="break-words text-[clamp(2.6rem,7vw,7rem)] leading-[0.98] tracking-[-0.05em]">Guardelio</h1>
            <p className="mt-6 text-[clamp(1.4rem,3vw,2.4rem)]">{guardelio.lema}</p>
            <p className="medida-texto mt-6 leading-relaxed text-mineral">{guardelio.resumo}</p>
            <a href={guardelio.site} target="_blank" rel="noreferrer" className="alvo-toque tecnica mt-8 inline-flex items-center rounded-full bg-signal px-6 text-ink hover:bg-glow">ABRIR O SITE DO GUARDELIO ↗</a>
          </div>
          <Image src={guardelio.icone.src} alt="Ícone do Guardelio: um pequeno robô de vigia verde." width={512} height={512} priority sizes="(min-width:1024px) 300px, 200px" className="mx-auto w-48 rounded-[2rem] lg:col-span-4 lg:w-72" />
        </div>
      </Container>
    </header>
    <Section indice="01 / COMO FUNCIONA" rotulo="Como funciona o Guardelio">
      <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {guardelio.recursos.map(item => <section key={item.titulo} className="border-t border-line pt-6"><h2 className="text-2xl">{item.titulo}</h2><p className="mt-4 leading-relaxed text-mineral">{item.texto}</p></section>)}
      </div>
    </Section>
    <Section indice="02 / PLANOS" rotulo="Planos do Guardelio">
      <h2 className="text-3xl">Essencial, Pro e Ultra.</h2>
      <p className="medida-texto mt-5 leading-relaxed text-mineral">{guardelio.planos} Preços e condições estão no site do Guardelio.</p>
    </Section>
    <Section indice="03 / DOCUMENTOS" rotulo="Planos segurança privacidade termos e contato" className="pb-24">
      <h2 className="text-3xl">Planos, privacidade e contato.</h2>
      <p className="medida-texto mt-5 leading-relaxed text-mineral">O Guardelio tem documentos próprios, publicados no site dele. {guardelio.parceria}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">{guardelio.documentos.map(doc => <li key={doc.href}><a href={doc.href} target="_blank" rel="noreferrer" className="alvo-toque flex items-center justify-between border-b border-line py-4 text-paper hover:text-signal">{doc.rotulo}<span aria-hidden="true">↗</span></a></li>)}</ul>
    </Section>
  </>;
}
