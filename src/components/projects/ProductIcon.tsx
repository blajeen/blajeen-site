export type ProductIconId = 'barbearia' | 'personal' | 'salao' | 'ecommerce';

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

  return null;
}
