import type { PortaId } from '@/lib/carrelio/tipos';
import type { CenaCarro, EstadoVisualCarro, Projecao } from './contrato';

/**
 * Uma cena do carro sem WebGL: anota cada chamada, guarda o último estado aplicado e deixa o teste
 * fazer o papel de quem mexe no carro (tocar numa porta, arrastar, os pontos projetados, a GPU
 * caindo). Serve aos testes de componente, que trocam `carregar.ts` por ela com `vi.mock`.
 */
export type CenaFalsa = CenaCarro & {
  readonly chamadas: { metodo: string; args: unknown[] }[];
  readonly ultimoEstado: EstadoVisualCarro | null;
  readonly descartada: boolean;
  /** Quantas vezes cada método foi chamado (enquadrar, zoom, definirAreaLivre...). */
  contar(metodo: string): number;
  /** Simula o toque numa porta (ou no porta-malas). */
  tocarPeca(peca: PortaId): void;
  /** Simula o começo de um arrasto. */
  arrastar(): void;
  /** Entrega pontos projetados, como a cena faz a cada quadro. */
  projetar(pontos: readonly Projecao[]): void;
  mudarContexto(situacao: 'perdido' | 'restaurado'): void;
  /** O que `exportarUsdz` devolve (padrão: `null`, como se a exportação falhasse). */
  usdz: Blob | null;
};

export function criarCenaFalsa(): CenaFalsa {
  const chamadas: { metodo: string; args: unknown[] }[] = [];
  const ouvintes = {
    projetar: new Set<(pontos: readonly Projecao[]) => void>(),
    tocar: new Set<(peca: PortaId) => void>(),
    arrastar: new Set<() => void>(),
    contexto: new Set<(situacao: 'perdido' | 'restaurado') => void>(),
  };
  let ultimoEstado: EstadoVisualCarro | null = null;
  let descartada = false;
  const anotar = (metodo: string) => (...args: unknown[]) => {
    chamadas.push({ metodo, args });
  };
  const ouvir = <T>(conjunto: Set<T>) => (ouvinte: T) => {
    conjunto.add(ouvinte);
    return () => {
      conjunto.delete(ouvinte);
    };
  };

  const falsa: CenaFalsa = {
    chamadas,
    get ultimoEstado() {
      return ultimoEstado;
    },
    get descartada() {
      return descartada;
    },
    usdz: null,
    contar: (metodo) => chamadas.filter((c) => c.metodo === metodo).length,
    aplicar(estado) {
      ultimoEstado = estado;
      chamadas.push({ metodo: 'aplicar', args: [estado] });
    },
    enquadrar: anotar('enquadrar'),
    zoom: anotar('zoom'),
    definirAreaLivre: anotar('definirAreaLivre'),
    aoProjetar: ouvir(ouvintes.projetar),
    aoTocarPeca: ouvir(ouvintes.tocar),
    aoArrastar: ouvir(ouvintes.arrastar),
    aoMudarContexto: ouvir(ouvintes.contexto),
    exportarUsdz() {
      chamadas.push({ metodo: 'exportarUsdz', args: [] });
      return Promise.resolve(falsa.usdz);
    },
    diagnostico: { quadros: 0, chamadas: 0, triangulos: 0 },
    descartar() {
      descartada = true;
      chamadas.push({ metodo: 'descartar', args: [] });
    },
    tocarPeca: (peca) => ouvintes.tocar.forEach((f) => f(peca)),
    arrastar: () => ouvintes.arrastar.forEach((f) => f()),
    projetar: (pontos) => ouvintes.projetar.forEach((f) => f(pontos)),
    mudarContexto: (situacao) => ouvintes.contexto.forEach((f) => f(situacao)),
  };
  return falsa;
}
