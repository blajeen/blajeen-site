import { BLOQUEADORES, type BloqueadorId } from '@/content/blockers';

/**
 * Estado explícito de informação ainda não definida.
 *
 * Existe para que o site nunca exiba um campo entre colchetes nem um valor plausível inventado.
 * O bloco diz o que falta e por quê; ele é conteúdo honesto, não um placeholder disfarçado.
 */
export function PendingNotice({
  bloqueador,
  explicacao,
}: {
  bloqueador: BloqueadorId;
  explicacao: string;
}) {
  const item = BLOQUEADORES[bloqueador];

  return (
    <div
      data-pendente={bloqueador}
      className="my-6 rounded-[var(--radius-control)] border border-dashed border-steel bg-raised/50 px-5 py-5"
    >
      <p className="tecnica flex items-center gap-2 text-mineral-dim">
        <span aria-hidden="true" className="inline-block size-[5px] rounded-full bg-mineral-dim" />
        Em definição
      </p>
      <p className="mt-3 text-base leading-snug text-paper">{item.titulo}</p>
      <p className="medida-texto mt-2 text-sm leading-relaxed text-mineral">{explicacao}</p>
    </div>
  );
}
