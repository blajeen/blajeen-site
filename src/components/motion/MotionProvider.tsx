'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const CHAVE = 'blajeen:motion';

type MotionContexto = {
  /** `true` quando o movimento decorativo pode rodar. */
  ativo: boolean;
  alternar: () => void;
  /** `true` quando o sistema operacional pede movimento reduzido. */
  reduzidoPeloSistema: boolean;
};

const Contexto = createContext<MotionContexto | null>(null);

/*
 * Duas fontes externas de verdade: a preferência do sistema e a escolha guardada no navegador.
 * `useSyncExternalStore` é a forma correta de assinar as duas — o servidor renderiza o estado
 * padrão e o cliente reconcilia sem efeito que dispare renderização em cascata.
 */

const CONSULTA_REDUZIDO = '(prefers-reduced-motion: reduce)';

function assinarReduzido(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA_REDUZIDO);
  consulta.addEventListener('change', aoMudar);
  return () => consulta.removeEventListener('change', aoMudar);
}

const ouvintes = new Set<() => void>();

function assinarPreferencia(aoMudar: () => void) {
  ouvintes.add(aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
  };
}

/** Espelho da escolha quando o armazenamento está bloqueado; mantém o botão funcionando. */
let preferenciaEmMemoria: 'on' | 'off' | null = null;

function lerPreferencia(): 'on' | 'off' {
  try {
    const salvo = window.localStorage.getItem(CHAVE);
    if (salvo === 'on' || salvo === 'off') return salvo;
  } catch {
    // Navegação privada ou armazenamento bloqueado: cai no espelho em memória.
  }
  return preferenciaEmMemoria ?? 'on';
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduzidoPeloSistema = useSyncExternalStore(
    assinarReduzido,
    () => window.matchMedia(CONSULTA_REDUZIDO).matches,
    () => false,
  );

  const preferencia = useSyncExternalStore(assinarPreferencia, lerPreferencia, () => 'on' as const);

  const ativo = preferencia === 'on' && !reduzidoPeloSistema;

  // Escrita em sistema externo: o atributo que a folha de estilo global consulta.
  useEffect(() => {
    document.documentElement.dataset['motion'] = ativo ? 'on' : 'off';
  }, [ativo]);

  const alternar = useCallback(() => {
    const proximo = lerPreferencia() === 'on' ? 'off' : 'on';
    preferenciaEmMemoria = proximo;
    try {
      window.localStorage.setItem(CHAVE, proximo);
    } catch {
      // Preferência não persistida entre sessões; a sessão atual respeita a escolha.
    }
    ouvintes.forEach((ouvinte) => ouvinte());
  }, []);

  const valor = useMemo(
    () => ({ ativo, alternar, reduzidoPeloSistema }),
    [ativo, alternar, reduzidoPeloSistema],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useMotion(): MotionContexto {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useMotion precisa estar dentro de <MotionProvider>.');
  }
  return contexto;
}
