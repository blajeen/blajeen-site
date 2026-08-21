import Link from 'next/link';

function FormIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-11"
    >
      <path d="M14 6h16l7 7v29H14a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Z" />
      <path d="M30 6v8h7M17 22h13M17 29h13M17 36h8" />
      <path d="m15.5 21.5 1.5 1.5 3-3M15.5 28.5 17 30l3-3" />
    </svg>
  );
}

export function ProjectFormCard({ slug, showAction = true }: { slug: string; showAction?: boolean }) {
  return (
    <aside className="rounded-[var(--radius-panel)] border border-signal/35 bg-signal/[0.045] p-6 sm:p-8">
      <div className={`grid gap-6 sm:items-center ${showAction ? 'sm:grid-cols-[auto_1fr_auto]' : 'sm:grid-cols-[auto_1fr]'}`}>
        <span className="grid size-16 place-items-center rounded-2xl border border-signal/35 bg-ink text-signal">
          <FormIcon />
        </span>
        <div>
          <p className="tecnica text-signal">PARA QUEM VAI CONTRATAR</p>
          <h2 className="mt-3 text-[clamp(1.45rem,3vw,2.15rem)] leading-tight tracking-[-0.035em]">
            Preencher briefing do projeto
          </h2>
          <p className="mt-3 max-w-[67ch] text-sm leading-relaxed text-mineral">
            Decidiu contratar? São quatro etapas curtas com as informações essenciais para adaptar
            o produto. O que faltar pode ser alinhado depois com a equipe.
          </p>
        </div>
        {showAction ? (
          <Link
            href={`/projects/${slug}/formulario`}
            className="alvo-toque tecnica inline-flex w-fit items-center gap-3 rounded-full border border-signal px-5 text-signal transition-colors hover:bg-signal hover:text-ink"
          >
            PREENCHER
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
