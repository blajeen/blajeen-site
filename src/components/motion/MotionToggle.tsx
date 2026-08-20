'use client';

import { useMotion } from './MotionProvider';

/**
 * Controle explícito de movimento.
 *
 * Quando o sistema já pede movimento reduzido, o botão informa isso em vez de fingir que a
 * escolha do site prevalece — a preferência do sistema sempre vence.
 */
export function MotionToggle({ className }: { className?: string }) {
  const { ativo, alternar, reduzidoPeloSistema } = useMotion();

  if (reduzidoPeloSistema) {
    return (
      <p className={['tecnica text-mineral-dim', className].filter(Boolean).join(' ')}>
        MOVIMENTO: DESLIGADO{' '}
        <span className="normal-case tracking-normal">(preferência do sistema)</span>
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={!ativo}
      className={[
        'alvo-toque tecnica inline-flex items-center gap-2 rounded-full border border-line px-4 text-mineral-dim transition-colors duration-150 hover:border-signal/50 hover:text-signal',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        data-ativo={ativo}
        className="inline-block size-[5px] rounded-full bg-mineral-dim data-[ativo=true]:bg-signal data-[ativo=true]:shadow-[0_0_8px_var(--color-signal)]"
      />
      MOVIMENTO: {ativo ? 'LIGADO' : 'DESLIGADO'}
    </button>
  );
}
