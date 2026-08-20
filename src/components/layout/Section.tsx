import type { ReactNode } from 'react';

type SectionProps = {
  id?: string;
  indice?: string;
  children: ReactNode;
  className?: string;
  /** Rótulo acessível quando a seção não tem título visível. */
  rotulo?: string;
  rotuladaPor?: string;
};

/** Faixa editorial com o ritmo vertical do sistema e a régua técnica opcional. */
export function Section({ id, indice, children, className, rotulo, rotuladaPor }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={rotulo}
      aria-labelledby={rotuladaPor}
      className={['py-[var(--section-gap)]', className].filter(Boolean).join(' ')}
    >
      <Container>
        {indice ? (
          <p className="tecnica mb-8 flex items-center gap-4 text-signal sm:mb-10">
            {indice}
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
          </p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={['mx-auto w-full max-w-[1440px] px-[var(--gutter)]', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

/** Título de seção com o peso editorial do sistema. */
export function TituloSecao({
  children,
  id,
  className,
  nivel = 2,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  nivel?: 1 | 2 | 3;
}) {
  const Tag = `h${nivel}` as const;
  return (
    <Tag
      id={id}
      className={[
        'max-w-[18ch] text-[clamp(1.85rem,4.2vw,3.4rem)] leading-[1.04] tracking-[-0.045em]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}
