import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { JAECOO_5 } from '@/lib/carrelio/catalogo';
import { ROTAS, TODAS_AS_ROTAS } from '@/lib/routes';
import { atalhos, demonstracao, entregas, linkDoProjeto, materiais, ondeFica, passos, vantagens } from './carrelio';
import { carrelio, demonstracoes, produtos } from './produtos';

const todoTexto = JSON.stringify({ atalhos, vantagens, materiais, ondeFica, entregas, passos, demonstracao, carrelio });
const pagina = readFileSync(path.join(process.cwd(), 'src/app/produtos/carrelio/page.tsx'), 'utf8');

describe('os textos do Carrelio', () => {
  it('não prometem resultado, prazo nem preço do serviço', () => {
    for (const texto of [todoTexto, pagina]) {
      expect(texto).not.toMatch(/aument\w* (as )?vendas|\d+\s?% (a )?mais|conversão|em \d+ (dias|semanas)|R\$\s?\d+[.,]?\d* (por|o) (projeto|serviço)/i);
      expect(texto).not.toMatch(/realidade virtual|fotorrealis/i);
    }
  });

  it('nomeia a loja como quem recebeu a demonstração, nunca como cliente que usa o produto', () => {
    expect(pagina).toMatch(/PREPARADA PARA A/);
    expect(pagina).toMatch(/Não é o site da loja nem da marca/);
    for (const texto of [todoTexto, pagina]) expect(texto).not.toMatch(/Comeri (usa|adotou|já usa|é cliente)|cliente(s)? da Comeri/i);
  });

  it('diz o que é real e o que é de demonstração, e que o painel está sem login', () => {
    expect(demonstracao.real.join(' ')).toMatch(/Jaecoo 5/);
    expect(demonstracao.deDemonstracao.join(' ')).toMatch(/estoque/);
    expect(demonstracao.semLogin).toMatch(/sem login/);
    expect(pagina).toMatch(/de demonstração/);
  });

  it('o catálogo cita as fontes do que é real', () => {
    expect(JAECOO_5.fontes.length).toBeGreaterThanOrEqual(2);
    for (const fonte of JAECOO_5.fontes) expect(fonte.url).toMatch(/^https:\/\//);
  });

  it('manda o pedido para o formulário certo', () => {
    const link = new URL(linkDoProjeto(), 'https://exemplo.test');
    expect(link.pathname).toBe(ROTAS.crieSeuProjeto);
    expect(link.searchParams.get('ideia')!.length).toBeLessThanOrEqual(600);
    expect(link.hash).toBe('#comecar');
  });

  it('entra em Produtos como demonstração sob orçamento, ao lado do Torrelio', () => {
    expect(demonstracoes).toContain(carrelio);
    expect(produtos.map((p) => p.id)).not.toContain('carrelio');
    expect(TODAS_AS_ROTAS).toContain(carrelio.rota);
    expect(carrelio.rota).toBe('/produtos/carrelio');
  });
});
