import { describe, expect, it, vi } from 'vitest';
import { estadoDoPoster } from './estado-inicial';
import { criarCenaFalsa } from './falsa';

describe('a cena falsa (para os testes da interface)', () => {
  it('guarda o estado, conta chamadas e faz o papel de quem mexe no carro', async () => {
    const cena = criarCenaFalsa();
    const estado = estadoDoPoster(true);
    cena.aplicar(estado);
    expect(cena.ultimoEstado).toBe(estado);
    cena.enquadrar();
    cena.zoom(1);
    cena.zoom(-1);
    expect(cena.contar('enquadrar')).toBe(1);
    expect(cena.contar('zoom')).toBe(2);
    const tocou = vi.fn();
    const arrastou = vi.fn();
    const projetou = vi.fn();
    const contexto = vi.fn();
    const cancelar = cena.aoTocarPeca(tocou);
    cena.aoArrastar(arrastou);
    cena.aoProjetar(projetou);
    cena.aoMudarContexto(contexto);
    cena.tocarPeca('portaMalas');
    cena.arrastar();
    cena.projetar([{ id: 'farois', x: 10, y: 20, visivel: true }]);
    cena.mudarContexto('perdido');
    expect(tocou).toHaveBeenCalledWith('portaMalas');
    expect(arrastou).toHaveBeenCalledTimes(1);
    expect(projetou).toHaveBeenCalledWith([{ id: 'farois', x: 10, y: 20, visivel: true }]);
    expect(contexto).toHaveBeenCalledWith('perdido');
    cancelar();
    cena.tocarPeca('dianteiraEsquerda');
    expect(tocou).toHaveBeenCalledTimes(1);
    await expect(cena.exportarUsdz()).resolves.toBeNull();
    cena.descartar();
    expect(cena.descartada).toBe(true);
  });
});
