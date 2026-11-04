import Link from 'next/link';
import { ROTAS } from '@/lib/routes';

export function ProductTabs({ atual }: { atual: 'programas' | 'extensoes' }) {
  return (
    <nav aria-label="Categorias de produtos" className="mt-9 flex flex-wrap gap-3 border-b border-line pb-5">
      {[
        { id: 'programas', nome: 'Programas e projetos', href: ROTAS.produtos },
        { id: 'extensoes', nome: 'Extensões', href: ROTAS.extensoes },
      ].map((item) => (
        <Link key={item.id} href={item.href} aria-current={atual === item.id ? 'page' : undefined}
          className={`alvo-toque tecnica inline-flex items-center rounded-full border px-5 ${atual === item.id ? 'border-signal bg-signal text-ink' : 'border-line text-mineral hover:border-signal hover:text-paper'}`}>
          {item.nome}
        </Link>
      ))}
    </nav>
  );
}
