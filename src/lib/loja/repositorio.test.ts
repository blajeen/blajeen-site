import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EXEMPLOS, SOFTWARE_DA_LOJA } from './exemplos';

/**
 * Sem banco, o repositório guarda a loja em `<pasta do projeto>/.data/loja.json`. Cada teste aponta
 * a pasta para um diretório temporário e importa o módulo do zero, como num servidor que acabou de
 * subir.
 */
const pastas: string[] = [];

async function repositorioEm(pasta: string) {
  vi.spyOn(process, 'cwd').mockReturnValue(pasta);
  vi.stubEnv('DATABASE_URL', '');
  vi.resetModules();
  return import('./repositorio');
}

function pastaComLoja(estado?: object): string {
  const pasta = mkdtempSync(path.join(tmpdir(), 'loja-'));
  pastas.push(pasta);
  if (estado) {
    mkdirSync(path.join(pasta, '.data'));
    writeFileSync(path.join(pasta, '.data', 'loja.json'), JSON.stringify(estado));
  }
  return pasta;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  for (const pasta of pastas.splice(0)) rmSync(pasta, { recursive: true, force: true });
});

describe('repositório local da loja', () => {
  it('semeia os exclusivos e o software numa loja nova', async () => {
    const repositorio = await repositorioEm(pastaComLoja());
    const produtos = await repositorio.listarProdutos();
    expect(produtos).toHaveLength(EXEMPLOS.length + SOFTWARE_DA_LOJA.length);
    expect(produtos.filter((p) => p.categoria === 'software').map((p) => p.slug)).toEqual(SOFTWARE_DA_LOJA.map((p) => p.slug));
  });

  it('leva o software à loja que já tinha os exclusivos, uma vez só e sem trazer de volta o que foi apagado', async () => {
    // Uma loja de antes do software: os exclusivos já tinham entrado, e foram apagados no painel.
    const pasta = pastaComLoja({ produtos: [], pedidos: [], exemplos: true, eventos: [], configuracao: null });
    const primeira = await (await repositorioEm(pasta)).listarProdutos();
    expect(primeira.map((p) => p.slug)).toEqual(SOFTWARE_DA_LOJA.map((p) => p.slug));
    // O servidor reinicia: nada entra de novo.
    const segunda = await (await repositorioEm(pasta)).listarProdutos();
    expect(segunda.map((p) => p.id)).toEqual(primeira.map((p) => p.id));
  });

  it('tira de venda o software pago, uma vez só, sem mexer nos exclusivos', async () => {
    const repositorio = await repositorioEm(pastaComLoja());
    const produtos = await repositorio.listarProdutos();
    const barbelio = produtos.find((p) => p.slug === 'barbelio')!;
    const caneca = produtos.find((p) => p.categoria === 'casa')!;

    const vendidos = await repositorio.marcarSoftwareVendido([barbelio.id, caneca.id, barbelio.id]);
    expect(vendidos.map((p) => [p.slug, p.disponibilidade])).toEqual([['barbelio', 'ESGOTADO']]);
    expect((await repositorio.buscarProduto(caneca.id))?.disponibilidade).toBe(caneca.disponibilidade);

    // O webhook pode chegar duas vezes: continua vendido, e a data da venda não muda.
    const deNovo = await repositorio.marcarSoftwareVendido([barbelio.id]);
    expect(deNovo.map((p) => [p.slug, p.disponibilidade, p.atualizadoEm])).toEqual([['barbelio', 'ESGOTADO', vendidos[0]!.atualizadoEm]]);
  });
});
