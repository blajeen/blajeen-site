export type ProductIconId = 'barbearia' | 'personal' | 'cabelo' | 'salao' | 'ecommerce' | 'pet';

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

  if (id === 'cabelo') {
    return (
      <svg {...comum}>
        <circle cx="16" cy="14" r="5" />
        <circle cx="16" cy="34" r="5" />
        <path d="m20 18 20 20M20 30 40 10M21 24h9" />
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

  return (
    <svg {...comum}>
      <path d="M17 24c-5.5 1.1-8.6 5.1-7.4 9.1 1.1 3.7 5.7 5.2 9.4 3.1 3.1-1.8 6.9-1.8 10 0 3.7 2.1 8.3.6 9.4-3.1 1.2-4-1.9-8-7.4-9.1" />
      <ellipse cx="15" cy="15" rx="4" ry="5" />
      <ellipse cx="33" cy="15" rx="4" ry="5" />
      <ellipse cx="24" cy="11" rx="4" ry="5" />
    </svg>
  );
}
