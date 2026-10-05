import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXEMPLOS, SOFTWARE_DA_LOJA } from '@/lib/loja/exemplos';
import { aceitaPedido, vendaUnica } from '@/lib/loja/tipos';
import { parseProduto } from '@/lib/loja/validacao';
import { ROTAS } from '@/lib/routes';
import { submenus, rodape } from './navigation';
import { novidades } from './news';
import { avisoDemonstracao, fichaDoSoftware, legendaDaTela, SOFTWARE, vemNaCompra } from './software';

const raiz = process.cwd();

describe('software à venda na loja', () => {
  it('vende os seis sistemas prontos, sem o Espacelio e o Pipelio, que nunca existiram', () => {
    expect(SOFTWARE.map((s) => s.nome)).toEqual(['Lojalio', 'Foodelio', 'Doutelio', 'Beautelio', 'Studelio', 'Barbelio']);
    expect(SOFTWARE.map((s) => s.slug)).toEqual(SOFTWARE.map((s) => s.nome.toLowerCase()));
    const tudo = JSON.stringify(SOFTWARE);
    expect(tudo).not.toMatch(/Espacelio|Pipelio/);
  });

  it('mantém o site e a demonstração de cada sistema', () => {
    expect(SOFTWARE.map((s) => [s.slug, s.site, s.demo])).toEqual([
      ['lojalio', 'https://site-lojalio.vercel.app', 'https://site-lojalio.vercel.app/loja'],
      ['foodelio', 'https://site-foodelio.vercel.app', 'https://site-foodelio.vercel.app/cardapio/sabor-da-vila-demo'],
      ['doutelio', 'https://doutelio.com.br', 'https://doutelio.com.br/demo'],
      ['beautelio', 'https://site-beautelio.vercel.app', 'https://site-beautelio.vercel.app/loja'],
      ['studelio', 'https://site-studelio.vercel.app', 'https://site-studelio.vercel.app/estudio/studio-move-demo'],
      ['barbelio', 'https://site-barbelio.vercel.app', 'https://site-barbelio.vercel.app/barbearia-aurora-demo'],
    ]);
  });

  it('cobra entre R$ 1.500 e R$ 3.500 por sistema', () => {
    for (const s of SOFTWARE) {
      expect(s.precoSugerido, s.nome).toBeGreaterThanOrEqual(150000);
      expect(s.precoSugerido, s.nome).toBeLessThanOrEqual(350000);
    }
  });

  it('diz o que vem na compra: o código inteiro, o site e a marca, o nome trocável e a venda única', () => {
    const texto = vemNaCompra.map((item) => item.texto).join(' ');
    expect(texto).toMatch(/código-fonte completo/);
    expect(texto).toMatch(/site do produto, o nome e a identidade visual/);
    expect(texto).toMatch(/manter o nome ou pedir para a Blajeen Labs trocar/);
    expect(texto).toMatch(/vendido uma vez só/);
    expect(texto).toMatch(/negócio próprio/);
  });

  it('mantém três telas locais e distintas, com a demonstração separada das prévias ilustrativas', () => {
    const conteudos = new Set<string>();
    expect(avisoDemonstracao).toMatch(/dados, fotos, preços e operações fictícios/);
    for (const s of SOFTWARE) {
      expect(new Set(s.telas.map((t) => t.src)).size).toBe(3);
      expect(s.telas[0].tipo).toBe('Demonstração do produto');
      if (s.slug !== 'doutelio') expect(s.telas.slice(1).every((t) => t.tipo === 'Prévia ilustrativa do painel')).toBe(true);
      for (const tela of s.telas) {
        const arquivo = path.join(raiz, 'public', tela.src);
        expect(existsSync(arquivo), tela.src).toBe(true);
        const bytes = readFileSync(arquivo);
        expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
        expect(bytes.byteLength).toBeLessThan(250_000);
        conteudos.add(bytes.toString('base64'));
      }
      expect(s.publico).toMatch(/^Para /);
      expect(s.recursos).toHaveLength(4);
    }
    expect(conteudos.size).toBe(18);
  });

  it('mantém o agendamento do Barbelio como pedido sem conta, não confirmação automática', () => {
    const barbelio = fichaDoSoftware('barbelio')!;
    expect(barbelio.recursos.map((r) => r.texto).join(' ')).toMatch(/sem precisar criar uma conta/);
    expect(barbelio.observacao).toMatch(/não representa confirmação automática/);
  });
});

describe('software no catálogo da loja', () => {
  it('entra um produto por sistema, publicado, disponível e com uma opção digital pelo preço sugerido', () => {
    expect(SOFTWARE_DA_LOJA.map((p) => p.slug)).toEqual(SOFTWARE.map((s) => s.slug));
    for (const produto of SOFTWARE_DA_LOJA) {
      const ficha = fichaDoSoftware(produto.slug)!;
      expect(produto).toMatchObject({ nome: ficha.nome, categoria: 'software', colecao: ficha.segmento, disponibilidade: 'DISPONIVEL', status: 'PUBLICADO' });
      expect(vendaUnica(produto)).toBe(true);
      expect(aceitaPedido(produto)).toBe(true);
      expect(produto.opcoes).toEqual([{ id: 'padrao', rotulo: 'Código, site e marca', precoCentavos: ficha.precoSugerido, digital: true }]);
      expect(produto.resumo).toMatch(/Vendido inteiro: código, site e marca\.$/);
      expect(produto.resumo.length).toBeLessThanOrEqual(240);
      expect(produto.imagens.map((i) => i.url)).toEqual(ficha.telas.map((t) => t.src));
      for (const imagem of produto.imagens) expect(legendaDaTela(ficha, imagem.url)?.descricao).toBe(imagem.alt);
    }
  });

  it('não disputa endereço com os exclusivos nem com a sacola', () => {
    const enderecos = [...EXEMPLOS, ...SOFTWARE_DA_LOJA].map((p) => p.slug);
    expect(new Set(enderecos).size).toBe(enderecos.length);
    expect(enderecos).not.toContain('pedido');
  });

  it('passa pela mesma validação do painel', () => {
    for (const produto of SOFTWARE_DA_LOJA) expect(parseProduto(produto)).toMatchObject({ categoria: 'software', slug: produto.slug });
  });

  it('libera a categoria no banco de produção (migration 007)', () => {
    const sql = readFileSync(path.join(raiz, 'migrations', '007_loja_software.sql'), 'utf8');
    expect(sql).toContain(`CHECK (category IN ('software', 'colecionaveis', 'vestuario', 'casa', 'livros'))`);
  });
});

describe('o site sem a categoria SaaS', () => {
  it('apaga as páginas de SaaS', () => {
    for (const pagina of ['page.tsx', 'espacelio/page.tsx', 'doutelio/page.tsx', 'clinica-medica/page.tsx']) {
      expect(existsSync(path.join(raiz, 'src/app/projects', pagina)), pagina).toBe(false);
    }
    expect(existsSync(path.join(raiz, 'src/content/saas.ts'))).toBe(false);
  });

  it('leva cada endereço antigo ao sistema na loja, e o catálogo à categoria Software', () => {
    const config = readFileSync(path.join(raiz, 'next.config.ts'), 'utf8');
    for (const [antigo, sistema] of [
      ['doutelio', 'doutelio'], ['clinica-medica', 'doutelio'], ['barbelio', 'barbelio'], ['barbearia', 'barbelio'],
      ['beautelio', 'beautelio'], ['salao-estetica', 'beautelio'], ['studelio', 'studelio'], ['personal-studio', 'studelio'],
      ['lojalio', 'lojalio'], ['ecommerce', 'lojalio'], ['foodelio', 'foodelio'],
    ]) {
      expect(config).toContain(`['${antigo}', '${sistema}']`);
      expect(fichaDoSoftware(sistema!), sistema).not.toBeNull();
    }
    expect(config).toContain(`['/projects', '/projects/espacelio', '/projects/pipelio', '/projects/painel-administrativo']`);
    expect(config).toContain(`destination: '/loja#software'`);
  });

  it('tira o SaaS do menu e do rodapé, e Produtos aponta o software da loja', () => {
    expect(submenus.produtos.grupos.map((g) => g.titulo)).toEqual(['Programas']);
    expect(submenus.produtos.extras.map((e) => e.href)).toEqual([`${ROTAS.loja}#software`]);
    expect(Object.keys(rodape)).not.toContain('projetos');
  });

  it('aponta as novidades antigas dos SaaS para a loja, sem apagar o histórico', () => {
    expect(novidades.find((n) => n.id === 'saas-ativos-setembro-2026')).toMatchObject({ data: '2026-09-02', href: `${ROTAS.loja}#software` });
    expect(novidades.find((n) => n.id === 'barbearia-em-demonstracao')?.href).toBe('/loja/barbelio');
    for (const novidade of novidades) {
      expect(novidade.href ?? '', novidade.id).not.toMatch(/^\/projects(\/(espacelio|doutelio|clinica-medica))?$/);
    }
  });
});
