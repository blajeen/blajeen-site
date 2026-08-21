import { ProductIcon } from '@/components/projects/ProductIcon';

const modulos = ['SITE', 'AGENDA', 'PACIENTES', 'PRONTUÁRIO', 'DOCUMENTOS'] as const;

export function UpcomingMedicalVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate grid h-full overflow-hidden bg-[#0a0d0a] ${
        compact ? 'min-h-60 p-5' : 'min-h-[18rem] p-7 lg:min-h-[34rem] lg:p-10'
      }`}
    >
      <div className="absolute -right-[18%] -top-[28%] size-[78%] rounded-full bg-signal/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(183,255,25,0.035)_52%,transparent_100%)]" />

      <div className="relative flex items-start justify-between gap-5">
        <ProductIcon id="medico" className={compact ? 'size-10 text-signal' : 'size-14 text-signal'} />
        <span className="tecnica rounded-full border border-signal/35 px-3 py-2 text-[9px] text-signal">
          EM DESENVOLVIMENTO
        </span>
      </div>

      <div className="relative mt-auto">
        <p className="tecnica text-mineral-dim">CLÍNICA MÉDICA / VISÃO DO PRODUTO</p>
        <div className={`mt-5 grid gap-2 ${compact ? 'grid-cols-2' : 'sm:grid-cols-3'}`}>
          {modulos.map((modulo, index) => (
            <div
              key={modulo}
              className={`rounded-xl border border-line bg-surface/75 ${
                compact ? 'px-3 py-3' : 'min-h-20 px-4 py-4'
              }`}
            >
              <span className="tecnica text-[9px] text-signal">{String(index + 1).padStart(2, '0')}</span>
              <p className="tecnica mt-2 text-[9px] text-paper">{modulo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
