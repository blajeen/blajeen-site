import { useSyncExternalStore } from 'react';
import { estadoInicial, reduzir, type AcaoTorrelio, type EstadoTorrelio } from '@/lib/torrelio/estado';
import { CHAVE_DO_ARMAZENAMENTO, lerRegistro, serializar } from '@/lib/torrelio/persistencia';

/**
 * A loja da demonstração: o estado de domínio (status, preços, tabela, condição, obra, hotel) que
 * a visão do cliente e o painel de controle leem juntos. Fica no navegador de quem testa
 * (`localStorage`), com espelho em memória quando o armazenamento falha, e acompanha as outras
 * abas do mesmo navegador pelo evento `storage`: marque uma venda no painel numa aba, e a luz
 * acende na outra. O desfazer vive só na memória.
 */

export type Instantaneo = {
  estado: EstadoTorrelio;
  podeDesfazer: boolean;
  /** `false` quando o navegador não deixa guardar: a interface avisa que nada fica salvo. */
  persistente: boolean;
};

export type Loja = {
  obter(): Instantaneo;
  assinar(ouvinte: () => void): () => void;
  despachar(acao: AcaoTorrelio): void;
  desfazer(): void;
  /** Volta ao estado-base, limpa o desfazer e deixa uma só linha no histórico. */
  restaurar(): void;
  descartar(): void;
};

export const DESFAZER_MAXIMO = 20;
const ESPERA_DA_ESCRITA_MS = 150;

/** O que o servidor renderiza e o que a hidratação confere: sempre o estado-base. */
export const INSTANTANEO_DO_SERVIDOR: Instantaneo = { estado: estadoInicial(), podeDesfazer: false, persistente: true };

type Opcoes = {
  armazenamento: () => Storage | null;
  janela?: Pick<Window, 'addEventListener' | 'removeEventListener'> | null;
  agora?: () => Date;
};

export function criarLoja({ armazenamento, janela = null, agora = () => new Date() }: Opcoes): Loja {
  const ouvintes = new Set<() => void>();
  const pilha: EstadoTorrelio[] = [];
  let instantaneo: Instantaneo | null = null;
  let persistente = true;
  let escrita: ReturnType<typeof setTimeout> | null = null;

  const avisar = () => ouvintes.forEach((ouvinte) => ouvinte());

  function ler(): EstadoTorrelio {
    try {
      return lerRegistro(armazenamento()?.getItem(CHAVE_DO_ARMAZENAMENTO) ?? null) ?? estadoInicial();
    } catch {
      persistente = false;
      return estadoInicial();
    }
  }

  function atual(): Instantaneo {
    instantaneo ??= { estado: ler(), podeDesfazer: false, persistente };
    return instantaneo;
  }

  function trocar(estado: EstadoTorrelio) {
    instantaneo = { estado, podeDesfazer: pilha.length > 0, persistente };
    avisar();
  }

  function gravar() {
    if (escrita) clearTimeout(escrita);
    escrita = setTimeout(() => {
      escrita = null;
      try {
        const destino = armazenamento();
        if (!destino) throw new Error('sem armazenamento');
        destino.setItem(CHAVE_DO_ARMAZENAMENTO, serializar(atual().estado, agora().toISOString()));
      } catch {
        if (persistente) {
          persistente = false;
          trocar(atual().estado);
        }
      }
    }, ESPERA_DA_ESCRITA_MS);
  }

  function aoArmazenar(evento: StorageEvent) {
    if (evento.key !== CHAVE_DO_ARMAZENAMENTO && evento.key !== null) return;
    // Outra aba mudou a demonstração: segue o que ela gravou, e o desfazer desta aba perde o sentido.
    pilha.length = 0;
    trocar(lerRegistro(evento.newValue ?? null) ?? estadoInicial());
  }

  return {
    obter: atual,
    assinar(ouvinte) {
      if (!ouvintes.size) janela?.addEventListener('storage', aoArmazenar as EventListener);
      ouvintes.add(ouvinte);
      return () => {
        ouvintes.delete(ouvinte);
        if (!ouvintes.size) janela?.removeEventListener('storage', aoArmazenar as EventListener);
      };
    },
    despachar(acao) {
      const anterior = atual().estado;
      const proximo = reduzir(anterior, { ...acao, quando: acao.quando ?? agora().toISOString() });
      if (proximo === anterior) return;
      // Abrir o hotel não é uma mudança de quem testa: não entra no desfazer.
      if (acao.tipo !== 'hotel/iniciar') {
        pilha.push(anterior);
        if (pilha.length > DESFAZER_MAXIMO) pilha.shift();
      }
      trocar(proximo);
      gravar();
    },
    desfazer() {
      const anterior = pilha.pop();
      if (!anterior) return;
      trocar(anterior);
      gravar();
    },
    restaurar() {
      pilha.length = 0;
      trocar(reduzir(atual().estado, { tipo: 'demo/restaurar', quando: agora().toISOString() }));
      gravar();
    },
    descartar() {
      if (escrita) clearTimeout(escrita);
      janela?.removeEventListener('storage', aoArmazenar as EventListener);
      ouvintes.clear();
    },
  };
}

/** No servidor não há loja: só o estado-base, e as ações não fazem nada. */
const LOJA_DO_SERVIDOR: Loja = {
  obter: () => INSTANTANEO_DO_SERVIDOR,
  assinar: () => () => {},
  despachar: () => {},
  desfazer: () => {},
  restaurar: () => {},
  descartar: () => {},
};

let lojaDoNavegador: Loja | null = null;

export function obterLoja(): Loja {
  if (typeof window === 'undefined') return LOJA_DO_SERVIDOR;
  lojaDoNavegador ??= criarLoja({
    armazenamento: () => {
      try {
        return window.localStorage;
      } catch {
        return null;
      }
    },
    janela: window,
  });
  return lojaDoNavegador;
}

/** Para os testes: a próxima `obterLoja()` cria uma loja nova. */
export function reiniciarLoja(): void {
  lojaDoNavegador?.descartar();
  lojaDoNavegador = null;
}

export function useTorrelio(): Instantaneo & Pick<Loja, 'despachar' | 'desfazer' | 'restaurar'> {
  const loja = obterLoja();
  const instantaneo = useSyncExternalStore(loja.assinar, loja.obter, () => INSTANTANEO_DO_SERVIDOR);
  return { ...instantaneo, despachar: loja.despachar, desfazer: loja.desfazer, restaurar: loja.restaurar };
}
