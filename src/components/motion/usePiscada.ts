'use client';

import { useEffect, useState } from 'react';

type Opcoes = {
  /** Espera mínima entre piscadas, em ms. */
  intervaloMinimo?: number;
  /** Variação aleatória somada ao intervalo mínimo, em ms. */
  variacao?: number;
  /** Quanto tempo o olho fica fechado, em ms. */
  duracao?: number;
  /** `false` adia o início — usado enquanto as duas poses ainda estão carregando. */
  pronto?: boolean;
};

/**
 * Ritmo de piscada do laboratório.
 *
 * É o mesmo comportamento da marca viva e do mascote: intervalos pseudoaleatórios, possibilidade
 * rara de piscada dupla, pausa quando a aba está oculta e nada quando o movimento está desligado.
 * Compartilhar o hook mantém as duas criaturas do site com a mesma cadência.
 */
export function usePiscada(ativo: boolean, opcoes: Opcoes = {}): boolean {
  const { intervaloMinimo = 2900, variacao = 4800, duracao = 130, pronto = true } = opcoes;
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    if (!ativo || !pronto) return;

    let temporizador: ReturnType<typeof setTimeout>;
    const pendentes = new Set<ReturnType<typeof setTimeout>>();

    const agendar = (callback: () => void, atraso: number) => {
      const id = setTimeout(() => {
        pendentes.delete(id);
        callback();
      }, atraso);
      pendentes.add(id);
    };

    const piscar = () => {
      if (document.hidden) {
        temporizador = setTimeout(piscar, 2200);
        return;
      }

      setFechado(true);
      agendar(() => setFechado(false), duracao);

      if (Math.random() > 0.82) {
        agendar(() => setFechado(true), duracao * 2);
        agendar(() => setFechado(false), duracao * 3);
      }

      temporizador = setTimeout(piscar, intervaloMinimo + Math.random() * variacao);
    };

    temporizador = setTimeout(piscar, 2600 + Math.random() * 1800);

    return () => {
      clearTimeout(temporizador);
      pendentes.forEach(clearTimeout);
    };
  }, [ativo, pronto, intervaloMinimo, variacao, duracao]);

  // Com movimento desligado o olho fica aberto, sem depender de estado residual.
  return ativo && fechado;
}
