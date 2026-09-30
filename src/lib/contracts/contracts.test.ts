import { describe, expect, it } from 'vitest';
import { MODELOS, SERVICOS_BASE } from '@/content/contratos/modelos.generated';
import { SERVICOS_IDS } from '@/content/contratos/tipos';
import { catalogoVigente, parseAjustesCatalogo } from './catalogo';
import { renderizarCatalogo } from './catalogo-documento';
import { renderizarContrato, resolverMarcadores } from './documento';
import type { Contrato } from './types';
import { parseCliente, parseTermos } from './validation';
import { lerValor, reais, valorPorExtenso } from './valores';

function contrato(parcial: Partial<Contrato> = {}): Contrato {
  return {
    id: 'c1', numero: 'BJL-SITE-2026-001', servico: 'site', status: 'AGUARDANDO_CLIENTE',
    termos: { valor_total: '1.490,00', plano_inst: '1', resumo_combinado: 'Site da pousada' }, cliente: {},
    tokenHash: 'h', tokenEncrypted: 'e', tokenExpiresAt: '2099-01-01T00:00:00.000Z', clienteEnviadoEm: null, assinadoEm: null,
    entradaRecebidaEm: null, saldoRecebidoEm: null, pedidoId: null, criadoEm: '2026-09-30T12:00:00.000Z', atualizadoEm: '2026-09-30T12:00:00.000Z',
    ...parcial,
  };
}

describe('valores', () => {
  it('escreve valores por extenso como em contrato', () => {
    expect(valorPorExtenso(1490)).toBe('mil quatrocentos e noventa reais');
    expect(valorPorExtenso(2500)).toBe('dois mil e quinhentos reais');
    expect(valorPorExtenso(1)).toBe('um real');
    expect(valorPorExtenso(0.5)).toBe('cinquenta centavos');
    expect(valorPorExtenso(100)).toBe('cem reais');
    expect(valorPorExtenso(12490)).toBe('doze mil quatrocentos e noventa reais');
  });

  it('lê valores digitados no formato brasileiro', () => {
    expect(lerValor('1.490,00')).toBe(1490);
    expect(lerValor('R$ 2.990')).toBe(2990);
    expect(lerValor('39,9')).toBe(39.9);
    expect(lerValor('abc')).toBeNull();
    expect(reais(1490)).toBe('R$ 1.490');
    expect(reais(39.9)).toBe('R$ 39,90');
  });
});

describe('documento do contrato', () => {
  it('escapa o que vem do cliente e mostra exemplo no campo vazio', () => {
    const html = resolverMarcadores('{{contratante_nome|Nome do cliente||}} {{contratante_repr|Representante||1}}', {
      contratante_nome: '<script>alert(1)</script>',
    });
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(resolverMarcadores('{{contratante_nome|Nome do cliente||}}', {})).toContain('class="vazio"');
    expect(resolverMarcadores('{{contratante_repr|Representante||1}}', {})).toBe('—');
  });

  it('gera os cinco contratos sem marcador pendente e com os dados fixos da Blajeen', () => {
    const catalogo = catalogoVigente();
    for (const servico of SERVICOS_IDS) {
      const html = renderizarContrato(contrato({ servico, numero: `BJL-${MODELOS[servico].codigo}-2026-001` }), catalogo, { voltarPara: '/admin', rotuloVoltar: 'Voltar' });
      expect(html).not.toMatch(/\{\{|\[\[/);
      expect(html).toContain('57.194.521/0001-44');
      expect(html).toContain('mil quatrocentos e noventa reais');
      expect(html).toContain('O combinado');
    }
  });

  it('gera o catálogo com os preços vigentes', () => {
    const ajustes = parseAjustesCatalogo({ servicos: { site: { planos: { lp: { preco: '999' } } } } });
    const html = renderizarCatalogo(catalogoVigente(ajustes));
    expect(html).toContain('R$ 999');
    expect(html).not.toContain('SaaS');
  });
});

describe('catálogo', () => {
  it('aplica ajustes só em ids conhecidos e mantém o resto nos preços-base', () => {
    const ajustes = parseAjustesCatalogo({ servicos: { site: { planos: { lp: { preco: 800, prazo: '7 dias' }, inventado: { preco: 1 } } } } });
    const vigente = catalogoVigente(ajustes);
    expect(vigente.servicos.site.planos.find((p) => p.id === 'lp')?.preco).toBe(800);
    expect(vigente.servicos.site.planos.find((p) => p.id === 'lp')?.prazo).toBe('7 dias');
    expect(vigente.servicos.site.planos.find((p) => p.id === 'inst')?.preco).toBe(SERVICOS_BASE.site.planos.find((p) => p.id === 'inst')?.preco);
    expect(() => parseAjustesCatalogo({ servicos: { site: { planos: { lp: { preco: -5 } } } } })).toThrow();
  });
});

describe('validação', () => {
  it('normaliza o valor e descarta campos desconhecidos dos termos', () => {
    const termos = parseTermos({ valor_total: '1490', plano_inst: true, campo_estranho: 'x' });
    expect(termos.valor_total).toBe('1.490,00');
    expect(termos.plano_inst).toBe('1');
    expect(termos).not.toHaveProperty('campo_estranho');
    expect(() => parseTermos({ valor_total: 'mil reais' })).toThrow();
  });

  it('exige dados completos e aceite no envio do cliente', () => {
    const base = { contratante_nome: 'Ana Souza', contratante_doc: '529.982.247-25', contratante_endereco: 'Rua A, 1, Centro, Uberlândia/MG, 38400-000', contratante_email: 'ana@exemplo.com', contratante_tel: '(34) 99999-9999' };
    expect(() => parseCliente(base, true)).toThrow(/concorda/);
    expect(parseCliente({ ...base, aceite: 'on', port_sim: 'on' }, true)).toMatchObject({ contratante_nome: 'Ana Souza', port_sim: '1' });
    expect(() => parseCliente({ ...base, contratante_doc: '111.111.111-11', aceite: 'on' }, true)).toThrow(/CPF ou CNPJ/);
    expect(() => parseCliente({ ...base, contratante_doc: '11.222.333/0001-81', aceite: 'on' }, true)).toThrow(/representante/);
  });
});
