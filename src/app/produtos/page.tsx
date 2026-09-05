import type { Metadata } from 'next';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { produtos } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Produtos — Blajeen Labs',
  descricao:
    'Programas de computador do laboratório: baixar, instalar e usar. Sem conta, sem anúncio e sem versão paga.',
  rota: ROTAS.produtos,
});

export default function ProdutosPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">PROGRAMAS DE COMPUTADOR / PRA BAIXAR E USAR</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-[14ch] text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em] lg:col-span-8">
              Programas que rodam na sua máquina, e só nela.
            </h1>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10 lg:pb-2">
              Sem conta, sem servidor no meio e sem nada saindo do seu computador. Você baixa, abre
              e usa.
            </p>
          </div>
        </Container>
      </header>

      <Section
        indice="01 / PRODUTOS"
        rotulo="Produtos do laboratório"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <div className="grid gap-5">
          {produtos.map((app) => (
            <article
              key={app.id}
              className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-10"
            >
              <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-7">
                  <p className="tecnica text-signal">{app.estado}</p>
                  <h2 className="mt-5 text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.98] tracking-[-0.05em]">
                    {app.nome}
                  </h2>
                  <p className="mt-3 text-[1.05rem] leading-relaxed text-paper/80">{app.lema}</p>
                  <p className="medida-texto mt-5 text-sm leading-relaxed text-mineral">
                    {app.resumo}
                  </p>
                </div>

                <div className="lg:col-span-4 lg:col-start-9">
                  <dl className="grid gap-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-line pb-3">
                      <dt className="text-mineral">Versão</dt>
                      <dd className="font-mono">{app.versao}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-line pb-3">
                      <dt className="text-mineral">Roda em</dt>
                      <dd className="text-right">{app.requisitos}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-mineral">Preço</dt>
                      <dd>Nenhum</dd>
                    </div>
                  </dl>

                  <Link
                    href={app.rota}
                    className="alvo-toque tecnica mt-7 inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow"
                  >
                    VER E BAIXAR →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
