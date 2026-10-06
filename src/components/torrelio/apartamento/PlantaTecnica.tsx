'use client';

import { useId } from 'react';
import { blocosDaPlanta } from '@/lib/torrelio/paredes';
import { DIMENSOES_DOS_MOVEIS, PLANTA, type ComodoId, type Ponto, type TipoDeMovel } from '@/lib/torrelio/planta';
import { caixaDoDesenho, cotasDesenhadas, folhaDaPorta, matrizDoDesenho, trechoNaParede, type Orientacao } from './desenho';
import styles from './Apartamento.module.css';

/**
 * A planta técnica em SVG, gerada de `planta.ts`: paredes em poché cortadas a 1,50 m (portas e
 * janelas abertas), arcos de porta, mobiliário de referência em traço, guarda-corpo e cotas. Não
 * depende de WebGL: é o que aparece antes da maquete, no lugar dela se o 3D falhar e no celular
 * até a pessoa pedir o 3D. Os textos (nomes, áreas, cotas) ficam em HTML por cima, para lerem bem
 * em qualquer tamanho; aqui só há traço.
 */

/** Na planta, o corte é o de norma: 1,50 m acima do piso. */
const ALTURA_DO_CORTE_DA_PLANTA = 1.5;
const BLOCOS = blocosDaPlanta(ALTURA_DO_CORTE_DA_PLANTA);

const f = (n: number) => Number(n.toFixed(3));
const caminho = (pontos: readonly Ponto[], fechar = true) =>
  pontos.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('') + (fechar ? 'Z' : '');
const retangulo = (x0: number, y0: number, x1: number, y1: number) =>
  caminho([
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]);
const circulo = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;

/** O traço de cada móvel, no lugar dele, com a frente para +y (o giro vem do `transform`). */
function simbolo(tipo: TipoDeMovel): string {
  const { largura: w, profundidade: d } = DIMENSOES_DOS_MOVEIS[tipo];
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const borda = retangulo(x0, y0, x1, y1);
  switch (tipo) {
    case 'sofa':
      return `${borda}M${f(x0 + 0.18)} ${f(y1)}V${f(y0 + 0.22)}H${f(x1 - 0.18)}V${f(y1)}M${f(-0.0)} ${f(y0 + 0.22)}V${f(y1)}`;
    case 'mesa-de-jantar':
      return [retangulo(-0.6, -0.4, 0.6, 0.4), ...[-0.3, 0.3].flatMap((x) => [retangulo(x - 0.2, -0.64, x + 0.2, -0.46), retangulo(x - 0.2, 0.46, x + 0.2, 0.64)])].join('');
    case 'cama-casal':
      return `${borda}${retangulo(x0 + 0.1, y0 + 0.08, -0.04, y0 + 0.36)}${retangulo(0.04, y0 + 0.08, x1 - 0.1, y0 + 0.36)}M${f(x0)} ${f(y0 + 0.62)}H${f(x1)}`;
    case 'cama-solteiro':
      return `${borda}${retangulo(x0 + 0.1, y0 + 0.08, x1 - 0.1, y0 + 0.36)}M${f(x0)} ${f(y0 + 0.62)}H${f(x1)}`;
    case 'guarda-roupa':
      return `${borda}M${f(x0)} ${f(y1 - 0.06)}H${f(x1)}M${f(x0 + 0.08)} ${f(0)}H${f(x1 - 0.08)}`;
    case 'bancada':
      return `${borda}${circulo(-0.17, 0.02, 0.1)}${circulo(0.17, 0.02, 0.1)}`;
    case 'pia':
      return `${borda}${retangulo(x0 + 0.14, y0 + 0.12, x1 - 0.14, y1 - 0.1)}`;
    case 'geladeira':
      return `${borda}M${f(x0)} ${f(y1 - 0.07)}H${f(x1)}`;
    case 'vaso':
      return `${retangulo(-0.19, y0, 0.19, y0 + 0.17)}M${f(-0.16)} ${f(y0 + 0.17)}C${f(-0.2)} ${f(y1)} ${f(0.2)} ${f(y1)} ${f(0.16)} ${f(y0 + 0.17)}`;
    case 'box':
      return `${borda}M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}${circulo(0, 0, 0.04)}`;
    case 'maquina':
      return `${borda}${circulo(0, 0.03, 0.21)}`;
    case 'tapete':
      return borda;
    case 'planta':
      return `${circulo(0, 0, w / 2)}${circulo(0, 0, w / 5)}`;
    case 'mesa-da-varanda':
      return `${circulo(0, 0, 0.32)}${retangulo(-0.65, -0.17, -0.38, 0.17)}${retangulo(0.38, -0.17, 0.65, 0.17)}`;
  }
}

const PAREDES_EM_POCHE = BLOCOS.filter((b) => b.cortada)
  .map((b) => {
    const cos = Math.cos(b.angulo);
    const sen = Math.sin(b.angulo);
    const [cx, cy] = b.centro;
    const meioC = b.comprimento / 2;
    const meioE = b.espessura / 2;
    const canto = (s: number, t: number): Ponto => [cx + cos * s - sen * t, cy + sen * s + cos * t];
    return caminho([canto(-meioC, -meioE), canto(meioC, -meioE), canto(meioC, meioE), canto(-meioC, meioE)]);
  })
  .join('');

function desenhoDasAberturas() {
  const peitoris: string[] = [];
  const vidros: string[] = [];
  const folhas: string[] = [];
  const arcos: string[] = [];
  const vergas: string[] = [];
  for (const a of PLANTA.aberturas) {
    const inicio = a.centro - a.largura / 2;
    const fim = a.centro + a.largura / 2;
    const meia = (PLANTA.paredes.find((p) => p.id === a.parede)?.espessura ?? 0.1) / 2;
    if (a.tipo === 'janela' || a.tipo === 'balcao') {
      const [p0, p1] = trechoNaParede(a, inicio, fim, -meia);
      const [q0, q1] = trechoNaParede(a, inicio, fim, meia);
      peitoris.push(caminho([p0, p1, q1, q0]));
      if (a.tipo === 'janela') {
        for (const desvio of [-0.02, 0.02]) vidros.push(caminho(trechoNaParede(a, inicio, fim, desvio), false));
      }
    } else if (a.tipo === 'porta-de-correr') {
      vidros.push(caminho(trechoNaParede(a, inicio, a.centro + 0.06, -0.025), false));
      vidros.push(caminho(trechoNaParede(a, a.centro - 0.06, fim, 0.025), false));
    } else if (a.tipo === 'passagem') {
      vergas.push(caminho(trechoNaParede(a, inicio, fim), false));
    }
    const folha = folhaDaPorta(a);
    if (folha) {
      folhas.push(caminho([folha.dobradica, folha.aberta], false));
      arcos.push(`M${f(folha.fechada[0])} ${f(folha.fechada[1])}A${f(folha.raio)} ${f(folha.raio)} 0 0 ${folha.horario ? 1 : 0} ${f(folha.aberta[0])} ${f(folha.aberta[1])}`);
    }
  }
  return { peitoris: peitoris.join(''), vidros: vidros.join(''), folhas: folhas.join(''), arcos: arcos.join(''), vergas: vergas.join('') };
}

const ABERTURAS_DESENHADAS = desenhoDasAberturas();
const MOLHADOS: readonly ComodoId[] = ['cozinha', 'servico', 'banho-suite', 'banho-social'];

function desenhoDasCotas() {
  return cotasDesenhadas()
    .map(({ de, ate, vertical }) => {
      const tique = (p: Ponto) => `M${f(p[0] - 0.09)} ${f(p[1] + 0.09)}L${f(p[0] + 0.09)} ${f(p[1] - 0.09)}`;
      const chamada = (p: Ponto) => (vertical ? `M${f(p[0] - 0.12)} ${f(p[1])}H${f(p[0] + 0.3)}` : `M${f(p[0])} ${f(p[1] - 0.12)}V${f(p[1] + 0.3)}`);
      return `${caminho([de, ate], false)}${tique(de)}${tique(ate)}${chamada(de)}${chamada(ate)}`;
    })
    .join('');
}

const COTAS = desenhoDasCotas();

type Props = {
  orientacao: Orientacao;
  selecionado: ComodoId | null;
  destacado: ComodoId | null;
  /** Ponteiro sobre um cômodo (só complemento: a lista faz o mesmo pelo teclado). */
  aoPassar?(id: ComodoId | null): void;
  aoEscolher?(id: ComodoId): void;
  /** Texto para leitores de tela: o que o desenho mostra. */
  descricao: string;
};

export function PlantaTecnica({ orientacao, selecionado, destacado, aoPassar, aoEscolher, descricao }: Props) {
  const id = useId();
  const caixa = caixaDoDesenho(orientacao);
  const matriz = matrizDoDesenho(orientacao).map(f).join(' ');
  const comodoEmFoco = PLANTA.comodos.find((c) => c.id === (destacado ?? selecionado));

  return (
    <svg
      className={styles.svgDaPlanta}
      viewBox={`${f(caixa.x)} ${f(caixa.y)} ${f(caixa.largura)} ${f(caixa.altura)}`}
      role="img"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-descricao`}
    >
      <title id={`${id}-titulo`}>Planta técnica do apartamento (fictícia)</title>
      <desc id={`${id}-descricao`}>{descricao}</desc>
      <defs>
        <pattern id={`${id}-ladrilho`} width="0.3" height="0.3" patternUnits="userSpaceOnUse">
          <path d="M0 0H0.3M0 0V0.3" className={styles.ladrilho} />
        </pattern>
        <pattern id={`${id}-deque`} width="0.12" height="1" patternUnits="userSpaceOnUse">
          <path d="M0 0V1" className={styles.ladrilho} />
        </pattern>
      </defs>
      <g transform={`matrix(${matriz})`}>
        <path d={caminho(PLANTA.contorno)} className={styles.contorno} />
        {PLANTA.comodos.map((c) => (
          <g key={c.id}>
            <path
              d={caminho(c.poligono)}
              className={styles.piso}
              data-comodo={c.id}
              data-estado={c.id === selecionado ? 'selecionado' : c.id === destacado ? 'destaque' : undefined}
              onPointerEnter={aoPassar ? () => aoPassar(c.id) : undefined}
              onPointerLeave={aoPassar ? () => aoPassar(null) : undefined}
              onClick={aoEscolher ? () => aoEscolher(c.id) : undefined}
            />
            {MOLHADOS.includes(c.id) || c.id === 'varanda' ? (
              <path d={caminho(c.poligono)} fill={`url(#${id}-${c.id === 'varanda' ? 'deque' : 'ladrilho'})`} className={styles.textura} />
            ) : null}
          </g>
        ))}
        <path d={caminho(PLANTA.shaft)} className={styles.shaft} />
        <g className={styles.moveis}>
          {PLANTA.moveis.map((m, i) => (
            <path
              key={i}
              d={simbolo(m.tipo)}
              transform={`translate(${f(m.posicao[0])} ${f(m.posicao[1])}) rotate(${m.rotacao})`}
              className={m.tipo === 'tapete' ? styles.tapete : undefined}
            />
          ))}
        </g>
        <path d={PAREDES_EM_POCHE} className={styles.poche} />
        <path d={ABERTURAS_DESENHADAS.peitoris} className={styles.peitoril} />
        <path d={ABERTURAS_DESENHADAS.vidros} className={styles.vidro} />
        <path d={ABERTURAS_DESENHADAS.vergas} className={styles.verga} />
        <path d={ABERTURAS_DESENHADAS.folhas} className={styles.folha} />
        <path d={ABERTURAS_DESENHADAS.arcos} className={styles.arco} />
        <path d={caminho(PLANTA.guardaCorpo, false)} className={styles.guardaCorpo} />
        {comodoEmFoco ? <path d={caminho(comodoEmFoco.poligono)} className={styles.contornoDoFoco} /> : null}
        <path d={COTAS} className={styles.cota} />
      </g>
    </svg>
  );
}
