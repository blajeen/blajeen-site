import { entre, medir } from './motor';

describe('entre', () => {
  it('devolve o que fica entre dois trechos na ordem do documento, em qualquer nível', () => {
    document.body.innerHTML = `
      <main>
        <div data-conduto></div>
        <section><div id="a"></div><aside id="x1"></aside></section>
        <div id="x2"></div>
        <section><p id="x3"></p><div><div id="b"></div></div><p id="depois"></p></section>
      </main>`;
    const achados = entre(document.getElementById('a')!, document.getElementById('b')!).map((el) => el.id);
    expect(achados).toEqual(['x1', 'x2', 'x3']);
  });

  it('entre irmãos, só o que está no meio', () => {
    document.body.innerHTML = '<main><p id="antes"></p><div id="a"></div><p id="m1"></p><p id="m2"></p><div id="b"></div><p id="depois"></p></main>';
    const achados = entre(document.getElementById('a')!, document.getElementById('b')!).map((el) => el.id);
    expect(achados).toEqual(['m1', 'm2']);
  });
});

describe('medir', () => {
  // O jsdom não tem layout: cada elemento responde com a caixa escrita em data-caixa (x, y, largura,
  // altura).
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const [x = 0, y = 0, largura = 0, altura = 0] = (this.getAttribute('data-caixa') ?? '').split(',').map(Number);
      return { x, y, left: x, top: y, width: largura, height: altura, right: x + largura, bottom: y + altura } as DOMRect;
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('ignora trecho marcado dentro de outro; marca sem lado válido vira alternar', () => {
    document.body.innerHTML = `
      <main data-caixa="0,0,1440,3000">
        <div id="raiz" data-conduto data-caixa="0,0,1440,3000"></div>
        <section data-conduto-lado="direita" data-caixa="0,0,1440,1000" style="padding: 0">
          <div data-conduto-lado="esquerda" data-caixa="100,100,1200,500" style="padding: 0"></div>
        </section>
        <div data-caixa="0,1000,1440,100"></div>
        <section data-conduto-lado="qualquer" data-caixa="0,1100,1440,1000" style="padding: 0"></section>
      </main>`;
    const entrada = medir(document.getElementById('raiz')!, 900);
    expect(entrada).not.toBeNull();
    expect(entrada!.trechos.map((t) => t.lado)).toEqual(['direita', 'alternar']);
    // O bloco entre as duas seções é obstáculo da travessia; o trecho aninhado, não.
    expect(entrada!.trechos[1]!.obstaculos).toEqual([{ topo: 1000, base: 1100, esquerda: 0, direita: 1440 }]);
  });

  it('usa a altura de tela que o motor passa, e não a do momento', () => {
    document.body.innerHTML = `
      <main data-caixa="0,0,390,2000">
        <div id="raiz" data-conduto data-caixa="0,0,390,2000"></div>
        <section data-conduto-lado="alternar" data-caixa="0,0,390,1000" style="padding: 0"></section>
      </main>`;
    expect(medir(document.getElementById('raiz')!, 788)!.alturaDaTela).toBe(788);
  });
});
