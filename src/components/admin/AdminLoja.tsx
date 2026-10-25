'use client';

import { useState } from 'react';
import { AdminIcon, type AdminIconName } from './AdminIcon';
import { AdminLojaConfiguracao } from './AdminLojaConfiguracao';
import { AdminLojaPedidos } from './AdminLojaPedidos';
import { AdminLojaProdutos } from './AdminLojaProdutos';

type Aba = 'pedidos' | 'produtos' | 'configuracao';
const ABAS: Array<{ id: Aba; rotulo: string; icone: AdminIconName }> = [
  { id: 'pedidos', rotulo: 'Pedidos', icone: 'orders' },
  { id: 'produtos', rotulo: 'Produtos', icone: 'products' },
  { id: 'configuracao', rotulo: 'Frete e pagamento', icone: 'settings' },
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
      <div role="group" aria-label="Áreas da loja" className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-2">
        {ABAS.map((a) => (
          <button key={a.id} type="button" aria-pressed={aba === a.id} onClick={() => abrir(a.id)}
            className={`alvo-toque inline-flex items-center gap-2.5 rounded-xl border px-4 text-sm transition-colors ${aba === a.id ? 'border-signal/30 bg-signal/10 text-signal' : 'border-transparent text-mineral hover:border-line-strong hover:bg-raised hover:text-paper'}`}>
            <AdminIcon name={a.icone} className="h-[18px] w-[18px] shrink-0" />
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
