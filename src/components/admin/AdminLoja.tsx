'use client';

import { useState } from 'react';
import { AdminLojaConfiguracao } from './AdminLojaConfiguracao';
import { AdminLojaPedidos } from './AdminLojaPedidos';
import { AdminLojaProdutos } from './AdminLojaProdutos';

type Aba = 'pedidos' | 'produtos' | 'configuracao';
const ABAS: Array<{ id: Aba; rotulo: string }> = [
  { id: 'pedidos', rotulo: 'Pedidos' },
  { id: 'produtos', rotulo: 'Produtos' },
  { id: 'configuracao', rotulo: 'Frete e pagamento' },
];

/** A loja no painel: três áreas, uma por vez. A URL guarda a área aberta (`?aba=`). */
export function AdminLoja({ pedidoInicial, abaInicial }: { pedidoInicial?: string | undefined; abaInicial: Aba }) {
  const [aba, setAba] = useState<Aba>(pedidoInicial ? 'pedidos' : abaInicial);

  function abrir(id: Aba) {
    setAba(id);
    window.history.replaceState(null, '', id === 'pedidos' ? '/admin/loja' : `/admin/loja?aba=${id}`);
  }

  return (
    <>
      <div role="group" aria-label="Áreas da loja" className="mb-6 flex flex-wrap gap-2">
        {ABAS.map((a) => (
          <button key={a.id} type="button" aria-pressed={aba === a.id} onClick={() => abrir(a.id)}
            className={`alvo-toque rounded-full border px-5 text-sm transition-colors ${aba === a.id ? 'border-paper bg-paper text-ink' : 'border-line-strong text-mineral hover:text-paper'}`}>
            {a.rotulo}
          </button>
        ))}
      </div>
      {aba === 'pedidos' ? <AdminLojaPedidos idInicial={pedidoInicial} /> : null}
      {aba === 'produtos' ? <AdminLojaProdutos /> : null}
      {aba === 'configuracao' ? <AdminLojaConfiguracao /> : null}
    </>
  );
}
