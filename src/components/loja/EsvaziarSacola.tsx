'use client';

import { useEffect } from 'react';
import { esvaziarSacola } from './sacola';

/** Na volta do pagamento, a sacola já virou pedido. */
export function EsvaziarSacola() {
  useEffect(() => { esvaziarSacola(); }, []);
  return null;
}
