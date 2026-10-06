import type { CenaTorre, EstadoVisualTorre, ModoDaCamera, Projecao } from './contrato';

/**
 * Uma cena da torre sem WebGL: anota cada chamada e deixa o teste fazer o papel do visitante
 * (clicar numa unidade, mudar a câmera). Serve aos testes de componente, que trocam
 * `carregar.ts` por ela com `vi.mock`.
 */
export type CenaFalsa = CenaTorre & {
  readonly chamadas: { metodo: string; args: unknown[] }[];
  readonly ultimoEstado: EstadoVisualTorre | null;
  readonly descartada: boolean;
  escolher(indice: number | null): void;
  passar(indice: number | null): void;
  projetar(marcador: Projecao | null): void;
  mudarRumo(rumo: number): void;
  mudarCamera(modo: ModoDaCamera): void;
};

export function criarCenaFalsa(): CenaFalsa {
  const chamadas: { metodo: string; args: unknown[] }[] = [];
  const ouvintes = {
    escolher: new Set<(indice: number | null) => void>(),
    passar: new Set<(indice: number | null) => void>(),
    projetar: new Set<(marcador: Projecao | null) => void>(),
    rumo: new Set<(rumo: number) => void>(),
    camera: new Set<(modo: ModoDaCamera) => void>(),
  };
  let ultimoEstado: EstadoVisualTorre | null = null;
  let descartada = false;
  const anotar = (metodo: string) => (...args: unknown[]) => {
    chamadas.push({ metodo, args });
  };
  const ouvir = <T>(conjunto: Set<T>) => (ouvinte: T) => {
    conjunto.add(ouvinte);
    return () => conjunto.delete(ouvinte);
  };
  const avisar = <A>(conjunto: Set<(valor: A) => void>, valor: A) => conjunto.forEach((ouvinte) => ouvinte(valor));

  return {
    chamadas,
    get ultimoEstado() {
      return ultimoEstado;
    },
    get descartada() {
      return descartada;
    },
    aplicar(estado) {
      ultimoEstado = estado;
      chamadas.push({ metodo: 'aplicar', args: [estado] });
    },
    enquadrar: anotar('enquadrar'),
    mostrarUnidade: anotar('mostrarUnidade'),
    verVista: anotar('verVista'),
    mudarAndarDaVista: anotar('mudarAndarDaVista'),
    olhar: anotar('olhar'),
    voltarAoPredio: anotar('voltarAoPredio'),
    girar: anotar('girar'),
    zoom: anotar('zoom'),
    definirAreaLivre: anotar('definirAreaLivre'),
    aoEscolher: ouvir(ouvintes.escolher),
    aoPassar: ouvir(ouvintes.passar),
    aoProjetar: ouvir(ouvintes.projetar),
    aoMudarRumo: ouvir(ouvintes.rumo),
    aoMudarCamera: ouvir(ouvintes.camera),
    diagnostico: { quadros: 0, chamadas: 0, triangulos: 0 },
    descartar() {
      descartada = true;
      chamadas.push({ metodo: 'descartar', args: [] });
    },
    escolher: (indice) => avisar(ouvintes.escolher, indice),
    passar: (indice) => avisar(ouvintes.passar, indice),
    projetar: (marcador) => avisar(ouvintes.projetar, marcador),
    mudarRumo: (rumo) => avisar(ouvintes.rumo, rumo),
    mudarCamera: (modo) => avisar(ouvintes.camera, modo),
  };
}
