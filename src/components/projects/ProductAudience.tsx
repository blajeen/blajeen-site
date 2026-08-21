type Audience = {
  readonly title: string;
  readonly text: string;
};

export function ProductAudience({
  id,
  title,
  introduction,
  audiences,
}: {
  id: string;
  title: string;
  introduction: string;
  audiences: readonly Audience[];
}) {
  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <h2
          id={id}
          className="max-w-[16ch] text-[clamp(2rem,4.5vw,4rem)] leading-[0.98] tracking-[-0.05em] lg:col-span-7"
        >
          {title}
        </h2>
        <p className="medida-texto text-[1rem] leading-relaxed text-mineral lg:col-span-4 lg:col-start-9">
          {introduction}
        </p>
      </div>
      <div className="mt-12 grid auto-rows-fr gap-4 md:grid-cols-2">
        {audiences.map((audience, index) => (
          <article
            key={audience.title}
            className="grid min-h-52 grid-rows-[auto_1fr] rounded-[var(--radius-panel)] border border-line bg-surface/60 p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <h3 className="max-w-[16ch] text-[1.55rem] leading-tight tracking-[-0.035em]">
                {audience.title}
              </h3>
              <span className="tecnica text-signal">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <p className="mt-8 self-end text-sm leading-relaxed text-mineral">{audience.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
