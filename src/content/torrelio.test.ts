import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROTAS, TODAS_AS_ROTAS } from '@/lib/routes';
import { submenus } from './navigation';
import { demonstracoes, produtos, torrelio } from './produtos';
import { entregas, ficticio, letraMiudaDasVantagens, linkDoProjeto, materiais, ondeFica, vantagens } from './torrelio';

const todoTexto = JSON.stringify({ vantagens, letraMiudaDasVantagens, materiais, ondeFica, entregas, ficticio, torrelio });
const pagina = readFileSync(path.join(process.cwd(), 'src/app/produtos/torrelio/page.tsx'), 'utf8');

describe('os textos do Torrelio', () => {
  it('não prometem resultado, valorização, prazo ou preço do serviço', () => {
    for (const texto of [todoTexto, pagina]) {
      expect(texto).not.toMatch(/aument\w* (as )?vendas|\d+\s?% (a )?mais|valoriz|conversão|em \d+ (dias|semanas)|R\$\s?\d+[.,]?\d* (por|o) (projeto|serviço)/i);
      expect(texto).not.toMatch(/realidade virtual|fotorrealis|tour (virtual )?com fotos/i);
    }
  });

  it('diz o que é fictício, que o painel está sem login e o que fica no navegador', () => {
    expect(pagina).toMatch(/são fictícios/);
    expect(ficticio.semLogin).toMatch(/sem login/);
    expect(ficticio.lista.join(' ')).toMatch(/Residencial Vértice/);
    expect(letraMiudaDasVantagens).toMatch(/simulações/);
  });

  it('cita os projetos de hospedagem do portfólio sem dizer que eles usam o 3D', () => {
    const hotel = vantagens.find((g) => g.publico === 'Para hotéis')!;
    const reserva = hotel.itens.find((i) => i.links)!;
    expect(reserva.links!.map((l) => l.href)).toEqual([ROTAS.trabalhoSpotHotel, ROTAS.trabalhoDonaLia]);
    expect(reserva.texto).toMatch(/sem o 3D/);
  });

  it('lista o que a empresa envia e as formas de entrega pedidas pelo titular', () => {
    const incorporadora = materiais.find((g) => g.publico === 'Incorporadora')!.itens.map((i) => i.titulo).join(' | ');
    for (const item of ['Plantas', 'situação de cada apartamento', 'Informações gerais', 'vários ângulos', 'Endereço']) {
      expect(incorporadora).toContain(item);
    }
    const onde = ondeFica.map((o) => `${o.titulo} ${o.texto}`).join(' ');
    expect(onde).toMatch(/site de vocês/);
    expect(onde).toMatch(/aba nova dentro do painel/);
    expect(entregas.filter((e) => e.opcional).map((e) => e.titulo)).toEqual(['Planta 3D de cada tipologia']);
  });

  it('manda o pedido para o formulário certo, com o tipo e a ideia preenchidos', () => {
    const link = new URL(linkDoProjeto('hotel'), 'https://exemplo.test');
    expect(link.pathname).toBe(ROTAS.crieSeuProjeto);
    expect(link.searchParams.get('tipo')).toBe('Sistema ou plataforma');
    expect(link.searchParams.get('ideia')!.length).toBeLessThanOrEqual(600);
    expect(link.hash).toBe('#comecar');
  });

  it('entra em Produtos como demonstração sob orçamento, fora da lista dos programas gratuitos', () => {
    expect(demonstracoes[0]).toBe(torrelio);
    expect(produtos.map((p) => p.id)).not.toContain('torrelio');
    expect(TODAS_AS_ROTAS).toContain(torrelio.rota);
    expect(submenus.produtos.grupos.find((g) => g.titulo === 'Sob medida')!.itens.map((i) => i.href)).toEqual([ROTAS.produtoTorrelio, ROTAS.produtoCarrelio]);
    const listagem = readFileSync(path.join(process.cwd(), 'src/app/produtos/page.tsx'), 'utf8');
    expect(listagem).toContain("{ rotulo: 'Preço', valor: 'Sob orçamento' }");
  });
});
