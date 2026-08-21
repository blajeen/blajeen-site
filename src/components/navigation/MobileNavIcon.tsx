import type { NavIconId } from '@/content/types';

type Props = {
  id: NavIconId;
  className?: string | undefined;
};

const propriedades = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function MobileNavIcon({ id, className }: Props) {
  if (id === 'inicio') {
    return (
      <svg {...propriedades} className={className}>
        <path d="m3 10 9-7 9 7" />
        <path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" />
      </svg>
    );
  }

  if (id === 'engenharia') {
    return (
      <svg {...propriedades} className={className}>
        <path d="M9 3h6M10 3v5l-5.2 9.1A2.6 2.6 0 0 0 7 21h10a2.6 2.6 0 0 0 2.2-3.9L14 8V3" />
        <path d="M7.5 15h9" />
        <path d="m18.5 4 .45 1.05L20 5.5l-1.05.45L18.5 7l-.45-1.05L17 5.5l1.05-.45L18.5 4Z" />
      </svg>
    );
  }

  if (id === 'projetos-feitos') {
    return (
      <svg {...propriedades} className={className}>
        <path d="M3 6.5h7l2 2h9v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    );
  }

  if (id === 'produtos') {
    return (
      <svg {...propriedades} className={className}>
        <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
        <path d="m4 7.5 8 4.5 8-4.5V16l-8 5-8-5V7.5Z" />
        <path d="M12 12v9" />
      </svg>
    );
  }

  if (id === 'jogos') {
    return (
      <svg {...propriedades} className={className}>
        <path d="M8.5 7h7a5 5 0 0 1 4.8 3.6l1.2 4.2a3.2 3.2 0 0 1-5.2 3.3L14.5 16h-5l-1.8 2.1a3.2 3.2 0 0 1-5.2-3.3l1.2-4.2A5 5 0 0 1 8.5 7Z" />
        <path d="M7.5 11v4M5.5 13h4M16.5 11.5h.01M18.5 14h.01" />
      </svg>
    );
  }

  if (id === 'estudio') {
    return (
      <svg {...propriedades} className={className}>
        <path d="M8 3h8M9.5 3v5L5 17a2.7 2.7 0 0 0 2.4 4h9.2a2.7 2.7 0 0 0 2.4-4l-4.5-9V3" />
        <path d="M7.5 15.5c2-1 3.3 1 5.2 0s2.8-1.1 4.1-.2" />
        <circle cx="10" cy="12" r=".7" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (id === 'novidades') {
    return (
      <svg {...propriedades} className={className}>
        <path d="M5 10v4M8 8.5v7M8 9c4 0 6-2 9-5v16c-3-3-5-5-9-5" />
        <path d="M8 15 9.5 21H6l-1-6" />
        <path d="M20 8.5v7" />
      </svg>
    );
  }

  return (
    <svg {...propriedades} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
      <path d="m4 18 5.5-5M20 18l-5.5-5" />
    </svg>
  );
}
