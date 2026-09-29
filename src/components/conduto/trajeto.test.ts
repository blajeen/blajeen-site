import {
  MAXIMO_DE_JUNTAS,
  MEIA_LUVA,
  alturaEm,
  faixaLivre,
  malha,
  montarTrajeto,
  preenchimentoAte,
  preenchimentoPelaLeitura,
  remapear,
  resolverLados,
  FLOATS_POR_VERTICE,
  type Caixa,
  type Entrada,
  type Trecho,
} from './trajeto';

/*
 * Medidas reais da home em 1440 × 900 (lidas no navegador), arredondadas: hero, faixa de chamadas
 * (obstáculo), configurador, trabalhos, desafio e painel final, com o botão de destino.
 */
const LARGURA = 1440;

function trecho(lado: Trecho['lado'], topo: number, base: number, padding: [number, number, number], obstaculos: Caixa[] = []): Trecho {
  const [vertical, esquerda, direita] = padding;
  return {
    lado,
    borda: { topo, base, esquerda: 0, direita: LARGURA },
    conteudo: { topo: topo + vertical, base: base - vertical, esquerda, direita: LARGURA - direita },
    obstaculos,
  };
}

const faixaDeChamadas: Caixa = { topo: 859, base: 919, esquerda: 0, direita: LARGURA };
const botaoFinal: Caixa = { topo: 5490, base: 5538, esquerda: 1138, direita: 1345 };

function home(destino: Caixa | null = botaoFinal): Entrada {
  return {
    largura: LARGURA,
    alturaDaTela: 900,
    trechos: [
      { ...trecho('direita', 72, 859, [60, 57.6, 57.6]), conteudo: { topo: 142, base: 799, esquerda: 57.6, direita: 1382.4 } },
      trecho('esquerda', 919, 3518, [90, 57.6, 57.6], [faixaDeChamadas]),
      trecho('direita', 3518, 4433, [90, 57.6, 57.6]),
      trecho('direita', 4433, 5324, [90, 57.6, 57.6]),
      {
        lado: 'direita',
        borda: { topo: 5324, base: 5706, esquerda: 60, direita: 1380 },
        conteudo: { topo: 5384, base: 5646, esquerda: 95, direita: 1345 },
        obstaculos: [],
      },
    ],
    destino,
  };
}

function montar(entrada: Entrada = home()) {
  const t = montarTrajeto(entrada);
  if (!t) throw new Error('trajeto não montado');
  return t;
}

describe('faixaLivre', () => {
  it('pula o obstáculo e devolve a primeira faixa que cabe', () => {
    expect(faixaLivre(799, 1009, [faixaDeChamadas], 29)).toEqual([799, 859]);
  });

  it('descarta faixa menor que o mínimo e segue para a próxima', () => {
    expect(faixaLivre(840, 1009, [faixaDeChamadas], 29)).toEqual([919, 1009]);
  });

  it('devolve null quando nada cabe', () => {
    expect(faixaLivre(850, 930, [faixaDeChamadas], 29)).toBeNull();
  });
});

describe('montarTrajeto', () => {
  it('nunca sobe: a altura não diminui ao longo do tubo', () => {
    const { pontos } = montar();
    for (let i = 1; i < pontos.length; i++) {
      expect(pontos[i]!.y).toBeGreaterThanOrEqual(pontos[i - 1]!.y - 1e-6);
    }
  });

  it('o comprimento de arco cresce e bate com a distância entre os pontos', () => {
    const { pontos, total } = montar();
    let soma = 0;
    for (let i = 1; i < pontos.length; i++) {
      const a = pontos[i - 1]!;
      const b = pontos[i]!;
      soma += Math.hypot(b.x - a.x, b.y - a.y);
      expect(b.s).toBeGreaterThan(a.s);
    }
    expect(Math.abs(soma - total)).toBeLessThan(0.01);
  });

  it('atravessa o hero na faixa livre acima da faixa de chamadas, não atrás dela', () => {
    const { pontos } = montar();
    const horizontais = pontos.filter((p, i) => i > 0 && Math.abs(p.ty) < 1e-6 && Math.abs(pontos[i - 1]!.y - p.y) < 1e-6);
    const primeira = horizontais[0];
    expect(primeira?.y).toBeCloseTo(829, 5);
  });

  it('o corpo do tubo nunca entra na caixa de conteúdo de um trecho, fora a chegada ao botão', () => {
    const entrada = home();
    const t = montar(entrada);
    const yDestino = (botaoFinal.topo + botaoFinal.base) / 2;
    // Amostra fina ao longo do eixo, com o raio do vidro em volta de cada ponto.
    for (let i = 1; i < t.pontos.length; i++) {
      const a = t.pontos[i - 1]!;
      const b = t.pontos[i]!;
      const passos = Math.max(1, Math.ceil((b.s - a.s) / 4));
      for (let k = 0; k <= passos; k++) {
        const x = a.x + ((b.x - a.x) * k) / passos;
        const y = a.y + ((b.y - a.y) * k) / passos;
        if (Math.abs(y - yDestino) < 1e-6) {
          // O último trecho reto entra no painel final para encaixar no botão: ali o tubo tem de
          // caber inteiro na altura do botão, sem passar por cima nem por baixo dele.
          expect(y - t.raio).toBeGreaterThanOrEqual(botaoFinal.topo);
          expect(y + t.raio).toBeLessThanOrEqual(botaoFinal.base);
          continue;
        }
        for (const tr of entrada.trechos) {
          const c = tr.conteudo;
          const dentro =
            x + t.raio > c.esquerda && x - t.raio < c.direita && y + t.raio > c.topo && y - t.raio < c.base;
          expect(dentro, `ponto (${x.toFixed(1)}, ${y.toFixed(1)}) invade o conteúdo`).toBe(false);
        }
      }
    }
  });

  it('termina encostado na borda do botão, na altura do centro dele', () => {
    const t = montar();
    const fim = t.pontos[t.pontos.length - 1]!;
    expect(t.chegaAoDestino).toBe(true);
    expect(fim.x).toBeCloseTo(botaoFinal.direita, 5);
    expect(fim.y).toBeCloseTo((botaoFinal.topo + botaoFinal.base) / 2, 5);
    // A luva de saída fica rente ao botão.
    expect(t.juntas[t.juntas.length - 1]).toBeCloseTo(t.total - MEIA_LUVA * t.raio, 5);
  });

  it('sem espaço para a curva até o botão, termina no fim do último trecho', () => {
    const encostado: Caixa = { ...botaoFinal, direita: 1400, esquerda: 1200 };
    const t = montar(home(encostado));
    expect(t.chegaAoDestino).toBe(false);
    expect(t.pontos[t.pontos.length - 1]!.y).toBe(5646);
  });

  it('põe uma luva no meio de cada travessia e uma em cada divisa do mesmo lado', () => {
    const t = montar();
    // Duas travessias, duas divisas do lado direito (trabalhos/desafio e desafio/final) e a saída.
    expect(t.juntas).toHaveLength(5);
    const alturas = t.juntas.map((s) => Math.round(alturaEm(t, s)));
    expect(alturas).toEqual(expect.arrayContaining([829, 3518, 4433, 5324]));
  });

  // Medidas da home no celular (390 × 844): margem de 16 px entre a borda e o texto.
  const celular = (margem = 16): Entrada => ({
    largura: 390,
    alturaDaTela: 844,
    trechos: [
      { lado: 'direita', borda: { topo: 64, base: 1116, esquerda: 0, direita: 390 }, conteudo: { topo: 96, base: 1076, esquerda: margem, direita: 390 - margem }, obstaculos: [] },
      { lado: 'esquerda', borda: { topo: 1200, base: 4701, esquerda: 0, direita: 390 }, conteudo: { topo: 1260, base: 4641, esquerda: margem, direita: 390 - margem }, obstaculos: [{ topo: 1116, base: 1200, esquerda: 0, direita: 390 }] },
      { lado: 'direita', borda: { topo: 4701, base: 8065, esquerda: 0, direita: 390 }, conteudo: { topo: 4761, base: 8025, esquerda: margem, direita: 390 - margem }, obstaculos: [] },
    ],
    destino: { topo: 7976, base: 8024, esquerda: 24, direita: 206 },
  });

  it('no celular o tubo corre encostado na borda, à vista, fora da faixa do anel de foco', () => {
    const t = montarTrajeto(celular())!;
    expect(t.trilhosForaDaTela).toBe(false);
    expect(t.chegaAoDestino).toBe(true);
    expect(t.travessias.map((x) => Math.round(x.y))).toEqual([1096, 4701, 8000]);
    // O vidro inteiro fica na tela, e para a 5 px do conteúdo (o anel de foco), com a tolerância
    // de 1 px que o QA dá ao vidro.
    expect(t.raio).toBeGreaterThanOrEqual(5);
    // Os trechos retos na vertical (as curvas saem do trilho para a travessia).
    const noTrilho = t.pontos.filter((p) => Math.abs(p.ty) === 1);
    expect(noTrilho.length).toBeGreaterThan(4);
    for (const p of noTrilho) {
      const de = p.x - t.raio;
      const ate = p.x + t.raio;
      const naMargem = ate <= 16 - 5 + 1 || de >= 390 - 16 + 5 - 1;
      expect(de >= 0 && ate <= 390 && naMargem, `trilho em x ${p.x.toFixed(1)}`).toBe(true);
    }
  });

  it('só numa margem estreita demais para o tubo o trilho sai da tela', () => {
    const t = montarTrajeto(celular(12))!;
    expect(t.trilhosForaDaTela).toBe(true);
    // Todo ponto cujo vidro aparece na tela está numa travessia ou na chegada ao botão.
    const curva = Math.max(t.raio * 3.2, t.raio * 2.3 + 4);
    for (const p of t.pontos) {
      if (p.x + t.raio < 0 || p.x - t.raio > 390) continue;
      const perto = t.travessias.some((x) => Math.abs(p.y - x.y) <= curva + t.raio);
      expect(perto, `ponto visível fora de travessia em (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).toBe(true);
    }
  });
});

describe('resolverLados', () => {
  const alto = (lado: Trecho['lado'], altura: number, topo = 0): Trecho => ({
    lado,
    borda: { topo, base: topo + altura, esquerda: 0, direita: LARGURA },
    conteudo: { topo, base: topo + altura, esquerda: 60, direita: LARGURA - 60 },
    obstaculos: [],
  });

  it('respeita os lados fixos da home', () => {
    expect(resolverLados(home().trechos, 900)).toEqual(['direita', 'esquerda', 'direita', 'direita', 'direita']);
  });

  it('alternar só troca de lado depois de 80% de uma tela do mesmo lado', () => {
    // Seções de 1000, 300, 300, 1200 e 500 px numa tela de 900: troca depois da primeira, segura as
    // duas curtas e a longa do mesmo lado, e troca de novo na última.
    const trechos = [1000, 300, 300, 1200, 500].map((h) => alto('alternar', h));
    expect(resolverLados(trechos, 900)).toEqual(['direita', 'esquerda', 'esquerda', 'esquerda', 'direita']);
  });

  it('troca com 80% exatos de uma tela, e não com um pixel a menos', () => {
    expect(resolverLados([alto('alternar', 720), alto('alternar', 500)], 900)).toEqual(['direita', 'esquerda']);
    expect(resolverLados([alto('alternar', 719), alto('alternar', 500)], 900)).toEqual(['direita', 'direita']);
  });

  it('um lado fixo no meio vale como está e a contagem recomeça nele', () => {
    // Sem recomeçar, os 1000 px antes do lado fixo já pediriam troca no terceiro trecho.
    const trechos = [alto('alternar', 1000), alto('direita', 200), alto('alternar', 600), alto('alternar', 300)];
    expect(resolverLados(trechos, 900)).toEqual(['direita', 'direita', 'direita', 'esquerda']);
  });

  it('numa página de seções alternadas, o trajeto troca de lado e nunca invade o conteúdo', () => {
    const trechos = [0, 1, 2, 3].map((i) => {
      const topo = 72 + i * 1100;
      return { ...alto('alternar', 1000, topo), conteudo: { topo: topo + 80, base: topo + 920, esquerda: 46, direita: LARGURA - 46 } };
    });
    const t = montarTrajeto({ largura: LARGURA, alturaDaTela: 900, trechos, destino: null });
    expect(t).not.toBeNull();
    expect(t!.travessias).toHaveLength(3);
    // Sem destino, o tubo termina numa tampa de metal.
    expect(t!.juntas[t!.juntas.length - 1]).toBeCloseTo(t!.total - MEIA_LUVA * t!.raio, 5);
    for (const p of t!.pontos) {
      for (const tr of trechos) {
        const c = tr.conteudo;
        const dentro = p.x + t!.raio > c.esquerda && p.x - t!.raio < c.direita && p.y + t!.raio > c.topo && p.y - t!.raio < c.base;
        expect(dentro, `ponto (${p.x.toFixed(1)}, ${p.y.toFixed(1)}) invade o conteúdo`).toBe(false);
      }
    }
  });

  it('numa página longa guarda todas as luvas, inclusive a tampa do fim', () => {
    // Nove seções que trocam de lado: oito travessias com a luva do meio, mais a tampa. O shader
    // desenha até MAXIMO_DE_JUNTAS de uma vez e o renderizador escolhe as que caem no canvas; o
    // trajeto não pode perder nenhuma (cortadas em 8, sumiam a tampa e as luvas do fim da página).
    const trechos = Array.from({ length: 9 }, (_, i) => {
      const topo = 72 + i * 1100;
      return { ...alto('alternar', 1000, topo), conteudo: { topo: topo + 80, base: topo + 920, esquerda: 46, direita: LARGURA - 46 } };
    });
    const t = montarTrajeto({ largura: LARGURA, alturaDaTela: 900, trechos, destino: null })!;
    expect(t.travessias).toHaveLength(8);
    expect(t.juntas).toHaveLength(9);
    expect(t.juntas.length).toBeGreaterThan(MAXIMO_DE_JUNTAS);
    expect(t.juntas[t.juntas.length - 1]).toBeCloseTo(t.total - MEIA_LUVA * t.raio, 5);
  });
});

describe('preenchimentoAte', () => {
  it('é zero acima do início e o total abaixo do fim', () => {
    const t = montar();
    expect(preenchimentoAte(t, -100)).toBe(0);
    expect(preenchimentoAte(t, 99999)).toBe(t.total);
  });

  it('só cresce conforme a linha de leitura desce', () => {
    const t = montar();
    let anterior = 0;
    for (let y = 0; y < 6000; y += 7) {
      const s = preenchimentoAte(t, y);
      expect(s).toBeGreaterThanOrEqual(anterior);
      anterior = s;
    }
  });

  it('enche a travessia inteira quando a linha passa da altura dela', () => {
    const t = montar();
    const antes = preenchimentoAte(t, 828.9);
    const depois = preenchimentoAte(t, 829);
    // A travessia do hero tem mais de mil pixels: pela altura sozinha ela entraria de uma vez.
    expect(depois - antes).toBeGreaterThan(1000);
  });
});

describe('preenchimentoPelaLeitura', () => {
  const faixa = 405;

  it('enche a travessia na proporção da rolagem, sem saltos', () => {
    const t = montar();
    let anterior = 0;
    let maiorPasso = 0;
    for (let y = 0; y < 6000; y += 5) {
      const s = preenchimentoPelaLeitura(t, y, faixa);
      expect(s).toBeGreaterThanOrEqual(anterior);
      maiorPasso = Math.max(maiorPasso, s - anterior);
      anterior = s;
    }
    // Rolar 5 px nunca empurra o líquido mais que ~25 px: a travessia do hero (quase 1,4 mil px)
    // se espalha pelos 405 px da faixa.
    expect(maiorPasso).toBeLessThan(25);
  });

  it('a frente nunca passa da linha de leitura', () => {
    // É o que segura o nível em 70% da tela: com a faixa antes da travessia, a frente da home em
    // 1440 × 900 ficava em 829 px com a linha em 630.
    const t = montar();
    for (let y = 0; y < 6000; y += 3) {
      const s = preenchimentoPelaLeitura(t, y, faixa);
      expect(alturaEm(t, s), `linha em ${y}`).toBeLessThanOrEqual(y + 1e-6);
    }
  });

  it('a travessia só corre de lado depois que a linha chega nela', () => {
    const t = montar();
    const travessia = t.travessias[0]!;
    // Na curva de entrada, o líquido acompanha a linha; na altura da travessia, está no começo dela.
    expect(preenchimentoPelaLeitura(t, travessia.y - 1, faixa)).toBeLessThan(travessia.sReta);
    expect(preenchimentoPelaLeitura(t, travessia.y, faixa)).toBeCloseTo(travessia.sReta, 5);
    // A linha já passou da altura da travessia, e o líquido ainda está a caminho do outro lado.
    expect(preenchimentoPelaLeitura(t, travessia.y + 50, faixa)).toBeLessThan(travessia.sFim);
  });

  it('na metade da faixa, a travessia está pela metade', () => {
    const t = montar();
    const travessia = t.travessias[0]!;
    const depois = preenchimentoAte(t, travessia.y + faixa);
    const meio = preenchimentoPelaLeitura(t, travessia.y + faixa / 2, faixa);
    expect(meio).toBeCloseTo(travessia.sReta + (depois - travessia.sReta) / 2, 5);
  });

  it('fora das faixas, é igual ao nível pela altura', () => {
    const t = montar();
    for (const y of [300, 2000, 4400]) {
      expect(preenchimentoPelaLeitura(t, y, faixa)).toBeCloseTo(preenchimentoAte(t, y), 5);
    }
  });

  it('é o inverso de alturaEm nos trechos verticais', () => {
    const t = montar();
    for (const y of [300, 2000, 4000, 5100]) {
      expect(alturaEm(t, preenchimentoAte(t, y))).toBeCloseTo(y, 5);
    }
  });
});

describe('remapear', () => {
  it('no meio de uma travessia, continua no meio dela', () => {
    const t = montar();
    const travessia = t.travessias[0]!;
    const meio = (travessia.sInicio + travessia.sFim) / 2;
    // Só pela altura, a frente saltaria para o fim da travessia.
    expect(remapear(t, t, meio)).toBeCloseTo(meio, 5);
  });

  it('quando o configurador cresce, a frente fica na mesma fração da travessia seguinte', () => {
    const antigo = montar();
    const entrada = home();
    const crescer = 300;
    entrada.trechos = entrada.trechos.map((tr, i) => {
      if (i === 0) return tr;
      const mover = (c: Caixa, deTopo: boolean) => ({ ...c, topo: c.topo + (deTopo ? crescer : 0), base: c.base + crescer });
      return { ...tr, borda: mover(tr.borda, i > 1), conteudo: mover(tr.conteudo, i > 1), obstaculos: tr.obstaculos };
    });
    entrada.destino = { ...botaoFinal, topo: botaoFinal.topo + crescer, base: botaoFinal.base + crescer };
    const novo = montar(entrada);
    const de = antigo.travessias[1]!;
    const para = novo.travessias[1]!;
    expect(para.y).toBeCloseTo(de.y + crescer, 5);
    const umTerco = de.sInicio + (de.sFim - de.sInicio) / 3;
    expect(remapear(antigo, novo, umTerco)).toBeCloseTo(para.sInicio + (para.sFim - para.sInicio) / 3, 5);
    // Fora das travessias, a frente guarda a altura na página.
    const noTrilho = preenchimentoAte(antigo, 2000);
    expect(remapear(antigo, novo, noTrilho)).toBeCloseTo(preenchimentoAte(novo, 2000), 5);
  });

  it('se o número de travessias muda, a frente guarda a altura na página', () => {
    // Celular, seções perto do limite de troca: com outra altura de tela, a primeira travessia
    // some, e a de mesmo índice passa a ser outra, 900 px abaixo.
    const alturas = [650, 900, 700, 900];
    let topo = 64;
    const trechos: Trecho[] = alturas.map((h) => {
      const tr: Trecho = {
        lado: 'alternar',
        borda: { topo, base: topo + h, esquerda: 0, direita: 390 },
        conteudo: { topo, base: topo + h, esquerda: 16, direita: 374 },
        obstaculos: [],
      };
      topo += h + 40;
      return tr;
    });
    const antigo = montarTrajeto({ largura: 390, alturaDaTela: 788, trechos, destino: null })!;
    const novo = montarTrajeto({ largura: 390, alturaDaTela: 844, trechos, destino: null })!;
    expect(antigo.travessias).toHaveLength(3);
    expect(novo.travessias).toHaveLength(2);
    const primeira = antigo.travessias[0]!;
    const meio = (primeira.sInicio + primeira.sFim) / 2;
    const altura = alturaEm(novo, remapear(antigo, novo, meio));
    expect(altura).toBeCloseTo(alturaEm(antigo, meio), 0);
    expect(altura).toBeLessThan(novo.travessias[0]!.y - 500);
  });
});

describe('malha', () => {
  it('gera dois vértices por ponto, com a faixa simétrica em volta do eixo', () => {
    const t = montar();
    const dados = malha(t);
    expect(dados.length).toBe(t.pontos.length * 2 * FLOATS_POR_VERTICE);
    const p = t.pontos[3]!;
    const x1 = dados[3 * 2 * FLOATS_POR_VERTICE]!;
    const x2 = dados[(3 * 2 + 1) * FLOATS_POR_VERTICE]!;
    expect((x1 + x2) / 2).toBeCloseTo(p.x, 4);
  });
});
