import styles from './AppliedEngineeringIcon.module.css';

export function AppliedEngineeringIcon({ className, decorativo = false }: { className?: string; decorativo?: boolean }) {
  return (
    <span
      className={[styles.orbita, className].filter(Boolean).join(' ')}
      role={decorativo ? undefined : 'img'}
      aria-label={decorativo ? undefined : 'Frasco de laboratório digital com faísca azul'}
      aria-hidden={decorativo || undefined}
    >
      <svg viewBox="0 0 160 160" fill="none" aria-hidden="true" className={styles.icone}>
        <path className={styles.modulo} d="M61 18h38v18H61zM67 36v28L35 119c-7 12 2 23 16 23h58c14 0 23-11 16-23L93 64V36" />
        <path className={styles.liquido} d="M48 112 70 75h20l22 37c5 9 0 16-11 16H59c-11 0-16-7-11-16Z" />
        <path className={styles.circuito} d="M54 108h18v-12h16v20h18M65 122v-10M96 95v13M76 84h9" />
        <circle className={styles.acido} cx="69" cy="112" r="4" />
        <circle className={styles.acido} cx="94" cy="120" r="3" />
        <path className={styles.faisca} d="m118 26-8 14 11-2-7 16 21-23-12 3 5-12-10 4Z" />
        <path className={styles.risco} d="M136 57h13M127 13l6-9M143 23l11-6" />
      </svg>
    </span>
  );
}
