export type ProductIconId =
  | 'barbearia'
  | 'personal'
  | 'salao'
  | 'ecommerce'
  | 'medico'
  | 'food'
  | 'crm'
  | 'admin';

export function ProductIcon({ id, className }: { id: ProductIconId; className?: string }) {
  const comum = {
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  };

  if (id === 'barbearia') {
    return (
      <svg {...comum}>
        <path d="M17 8h14a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" />
        <path d="m14 17 20 10M14 27l20 10M18 8V5M30 8V5M18 43v-3M30 43v-3" />
      </svg>
    );
  }

  if (id === 'personal') {
    return (
      <svg {...comum}>
        <path d="M8 20v8M13 16v16M35 16v16M40 20v8M13 24h22" />
        <path d="M18 11c2.3-2 9.7-2 12 0M18 37c2.3 2 9.7 2 12 0" />
      </svg>
    );
  }

  if (id === 'salao') {
    return (
      <svg {...comum}>
        <path d="M24 8c2.2 7.8 6.2 11.8 14 14-7.8 2.2-11.8 6.2-14 14-2.2-7.8-6.2-11.8-14-14 7.8-2.2 11.8-6.2 14-14Z" />
        <path d="M38 7v8M34 11h8M10 34v6M7 37h6" />
      </svg>
    );
  }

  if (id === 'ecommerce') {
    return (
      <svg {...comum}>
        <path d="M11 17h26l-2 23H13l-2-23Z" />
        <path d="M18 19v-5a6 6 0 0 1 12 0v5M17 27h14M20 33h8" />
      </svg>
    );
  }

  if (id === 'medico') {
    return (
      <svg {...comum}>
        <path d="M18 8v11a6 6 0 0 0 12 0V8" />
        <path d="M14 8h8M26 8h8M24 25v5a9 9 0 0 0 18 0v-3" />
        <circle cx="42" cy="23" r="4" />
        <path d="M15 38h10M20 33v10" />
      </svg>
    );
  }

  if (id === 'food') {
    return (
      <svg {...comum}>
        <path d="M10 8v13M6 8v5a4 4 0 0 0 8 0V8M6 11h8" />
        <path d="M21 8v13M18 8c0 3 3 3 3 6" />
      </svg>
    );
  }

  if (id === 'crm') {
    return (
      <svg {...comum}>
        <circle cx="10" cy="11" r="3" />
        <circle cx="24" cy="9" r="3" />
        <circle cx="37" cy="13" r="3" />
        <path d="M4 25c0-4 3-6 6-6s6 2 6 6M18 23c1-3 3-5 6-5 3 0 5 2 6 5M31 27c1-3 3-5 6-5 4 0 7 2 7 6" />
        <path d="M13 12.5 21 10.5M27 10l7 2" />
      </svg>
    );
  }

  if (id === 'admin') {
    return (
      <svg {...comum}>
        <rect x="6" y="7" width="36" height="29" rx="3" />
        <path d="M6 15h36M14 23h8M14 29h14M32 23h4M32 29h4" />
      </svg>
    );
  }

  return null;
}
