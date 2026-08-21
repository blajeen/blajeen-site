import { describe, expect, it } from 'vitest';
import { dataPorExtenso, novidades, novidadesPublicadas } from './news';

/**
 * As novidades são o único lugar do site com conteúdo datado, então o risco aqui é específico:
 * anunciar antes da hora. Estes testes travam isso.
 */
describe('novidades', () => {
  it('esconde item cuja data ainda não chegou', () => {
    const futuro = novidades.find((item) => item.data === '2026-08-25');
    expect(futuro, 'o lançamento do Revalio deveria estar no conteúdo').toBeDefined();

    const vespera = novidadesPublicadas(new Date('2026-08-24T23:00:00Z'));
    expect(vespera.map((item) => item.id)).not.toContain(futuro!.id);
  });

  it('publica o item no dia marcado', () => {
    const noDia = novidadesPublicadas(new Date('2026-08-25T00:05:00Z'));
    expect(noDia.map((item) => item.id)).toContain('revalio-nas-lojas');
  });

  it('ordena da mais recente para a mais antiga', () => {
    const lista = novidadesPublicadas(new Date('2026-09-01T12:00:00Z'));
    const datas = lista.map((item) => item.data);
    expect([...datas].sort().reverse()).toEqual(datas);
  });

  it('registra os quatro produtos em demonstração', () => {
    const ids = novidades.map((item) => item.id);
    expect(ids).toContain('barbearia-em-demonstracao');
    expect(ids).toContain('personal-studio-em-demonstracao');
    expect(ids).toContain('ecommerce-em-demonstracao');
    expect(ids).toContain('studio-beauty-em-demonstracao');
  });

  it('não promete data de lançamento dos jogos sem build', () => {
    for (const id of ['docalio', 'gramelio'] as const) {
      const item = novidades.find((novidade) => novidade.projeto === id);
      const texto = item?.texto.join(' ') ?? '';
      expect(texto, id).toMatch(/ainda não há build público/i);
      expect(texto, id).not.toMatch(/lançamento em|chega em|previs[ãa]o para/i);
    }
  });

  it('escreve a data por extenso em português', () => {
    expect(dataPorExtenso('2026-08-25')).toBe('25 de agosto de 2026');
  });
});
