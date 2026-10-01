import { existsSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { asaasConfigurado, statusDoEvento, tokenDoWebhookValido, vencimento } from './asaas';
import { EXEMPLOS, JOGOS_DA_LOJA } from './exemplos';
import { aceitaPedido, formatarPreco, lerPreco, mostraPreco, type Produto } from './tipos';
import {
  calcularPedido, cpfCnpjValido, parsePedidoLoja, parseProduto, precisaEnvio, validarEndereco,
} from './validacao';

const ENVIO = { pesoKg: 0.3, alturaCm: 4, larguraCm: 25, comprimentoCm: 30 };

function produto(parcial: Partial<Produto> = {}): Produto {
  return {
    id: 'p1', slug: 'camiseta', nome: 'Camiseta', resumo: '', descricao: '', categoria: 'vestuario', colecao: 'Morvelio',
    disponibilidade: 'DISPONIVEL', status: 'PUBLICADO', rotuloOpcoes: 'Tamanho',
    opcoes: [{ id: 'p', rotulo: 'P', precoCentavos: 8990, digital: false }, { id: 'm', rotulo: 'M', precoCentavos: 8990, digital: false }],
    imagens: [], envio: ENVIO, ordem: 0, criadoEm: '', atualizadoEm: '', ...parcial,
  };
}

const contato = { nome: 'Ana Souza', email: 'ana@exemplo.com', telefone: '(31) 99999-0000' };

describe('preço', () => {
  it('lê o jeito brasileiro de escrever dinheiro', () => {
    expect(lerPreco('89,90')).toBe(8990);
    expect(lerPreco('R$ 1.249,00')).toBe(124900);
    expect(lerPreco('89.9')).toBe(8990);
    expect(lerPreco('abc')).toBeNull();
    expect(lerPreco('')).toBeNull();
  });

  it('mostra em reais', () => {
    expect(formatarPreco(8990)).toBe('R$ 89,90');
  });
});

describe('CPF e CNPJ', () => {
  it('confere os dígitos verificadores', () => {
    expect(cpfCnpjValido('529.982.247-25')).toBe(true);
    expect(cpfCnpjValido('529.982.247-24')).toBe(false);
    expect(cpfCnpjValido('111.111.111-11')).toBe(false);
    expect(cpfCnpjValido('11.222.333/0001-81')).toBe(true);
    expect(cpfCnpjValido('11.222.333/0001-80')).toBe(false);
  });
});

describe('produto no painel', () => {
  const base = { nome: 'Boneco 3D de Catelio', categoria: 'colecionaveis', status: 'PUBLICADO', envio: ENVIO };

  it('deixa “Em breve” sem preço', () => {
    const p = parseProduto({ ...base, disponibilidade: 'EM_BREVE', opcoes: [{ rotulo: 'Padrão', precoCentavos: 0 }] });
    expect(p.disponibilidade).toBe('EM_BREVE');
    expect(p.slug).toBe('boneco-3d-de-catelio');
    expect(mostraPreco(p)).toBe(false);
    expect(aceitaPedido(p)).toBe(false);
  });

  it('não deixa sair de “Em breve” com preço zerado', () => {
    expect(() => parseProduto({ ...base, disponibilidade: 'DISPONIVEL', opcoes: [{ rotulo: 'Padrão', precoCentavos: 0 }] }))
      .toThrow(/Defina o preço/);
  });

  it('exige um pacote de frete plausível', () => {
    expect(() => parseProduto({ ...base, disponibilidade: 'EM_BREVE', opcoes: [{ rotulo: 'Padrão', precoCentavos: 0 }], envio: { ...ENVIO, pesoKg: 0 } }))
      .toThrow(/peso/);
  });
});

describe('pedido', () => {
  it('usa o preço do catálogo, não o do navegador, e junta itens repetidos', () => {
    const { itens, subtotalCentavos } = calcularPedido(
      [{ produtoId: 'p1', opcaoId: 'm', quantidade: 1 }, { produtoId: 'p1', opcaoId: 'm', quantidade: 2 }],
      [produto()],
    );
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ quantidade: 3, precoCentavos: 8990, opcaoRotulo: 'M' });
    expect(subtotalCentavos).toBe(26970);
  });

  it('recusa item em breve, esgotado, rascunho ou opção que sumiu', () => {
    const pedir = (p: Produto, opcaoId = 'p') => () => calcularPedido([{ produtoId: 'p1', opcaoId, quantidade: 1 }], [p]);
    expect(pedir(produto({ disponibilidade: 'EM_BREVE' }))).toThrow(/ainda não está à venda/);
    expect(pedir(produto({ disponibilidade: 'ESGOTADO' }))).toThrow(/esgotado/);
    expect(pedir(produto({ status: 'RASCUNHO' }))).toThrow(/saiu da loja/);
    expect(pedir(produto(), 'gg')).toThrow(/não existe mais/);
  });

  it('só pede endereço quando há algo para enviar', () => {
    expect(precisaEnvio([{ digital: true }])).toBe(false);
    expect(precisaEnvio([{ digital: true }, { digital: false }])).toBe(true);
    expect(() => validarEndereco({ cep: '30140071', logradouro: 'Rua A', numero: '10', complemento: '', bairro: 'Centro', cidade: 'BH', uf: 'XX' }))
      .toThrow(/UF/);
  });

  it('exige CPF quando o pagamento é online, e trata a armadilha de robôs', () => {
    const itens = [{ produtoId: 'p1', opcaoId: 'p', quantidade: 1 }];
    expect(() => parsePedidoLoja({ ...contato, itens }, { exigirDocumento: true })).toThrow(/CPF/);
    expect(parsePedidoLoja({ ...contato, itens, cpfCnpj: '529.982.247-25' }, { exigirDocumento: true }).contato.cpfCnpj).toBe('52998224725');
    expect(parsePedidoLoja({ ...contato, itens }, { exigirDocumento: false }).robo).toBe(false);
    expect(parsePedidoLoja({ ...contato, itens, site: 'http://spam' }, { exigirDocumento: false }).robo).toBe(true);
  });
});

describe('Asaas', () => {
  afterEach(() => { vi.unstubAllEnvs(); });

  it('só aceita o webhook com o token configurado', () => {
    expect(tokenDoWebhookValido('qualquer')).toBe(false);
    vi.stubEnv('ASAAS_WEBHOOK_TOKEN', 'segredo-longo');
    expect(tokenDoWebhookValido('segredo-longo')).toBe(true);
    expect(tokenDoWebhookValido('segredo-curto')).toBe(false);
    expect(tokenDoWebhookValido(null)).toBe(false);
  });

  it('aceita a chave com ou sem a barra do .env, e não conta só a barra', () => {
    vi.stubEnv('ASAAS_API_KEY', '\\');
    expect(asaasConfigurado()).toBe(false);
    vi.stubEnv('ASAAS_API_KEY', '\\$aact_hmlg_000Teste::abc123');
    expect(asaasConfigurado()).toBe(true);
    vi.stubEnv('ASAAS_API_KEY', 'aact_hmlg_000Teste::abc123');
    expect(asaasConfigurado()).toBe(true);
  });

  it('traduz os eventos de cobrança', () => {
    expect(statusDoEvento('PAYMENT_CONFIRMED')).toBe('PAGO');
    expect(statusDoEvento('PAYMENT_RECEIVED')).toBe('PAGO');
    expect(statusDoEvento('PAYMENT_REFUNDED')).toBe('ESTORNADO');
    expect(statusDoEvento('PAYMENT_DELETED')).toBe('CANCELADO');
    expect(statusDoEvento('PAYMENT_OVERDUE')).toBeNull();
  });

  it('vence em três dias, no formato do Asaas', () => {
    expect(vencimento(new Date('2026-10-01T15:00:00Z'))).toBe('2026-10-04');
  });
});

describe('catálogo de exemplo', () => {
  it('tem boneco 3D, camiseta e caneca de cada jogo, mais o livro nas duas versões', () => {
    for (const jogo of JOGOS_DA_LOJA) {
      for (const prefixo of ['boneco-3d', 'camiseta', 'caneca']) {
        expect(EXEMPLOS.some((e) => e.slug === `${prefixo}-${jogo.id}`)).toBe(true);
      }
    }
    const livro = EXEMPLOS.find((e) => e.slug === 'livro-de-morvelio');
    expect(livro?.opcoes.map((o) => [o.id, o.digital])).toEqual([['digital', true], ['colecionador', false]]);
    expect(EXEMPLOS).toHaveLength(JOGOS_DA_LOJA.length * 3 + 3);
  });

  it('entra todo em “Em breve”, com endereços únicos e imagens que existem', () => {
    expect(EXEMPLOS.every((e) => e.disponibilidade === 'EM_BREVE' && e.status === 'PUBLICADO')).toBe(true);
    expect(new Set(EXEMPLOS.map((e) => e.slug)).size).toBe(EXEMPLOS.length);
    const faltando = EXEMPLOS.flatMap((e) => e.imagens).filter((i) => !existsSync(path.join(process.cwd(), 'public', i.url)));
    expect(faltando).toEqual([]);
  });

  it('passa pela mesma validação do painel', () => {
    for (const exemplo of EXEMPLOS) expect(() => parseProduto(exemplo)).not.toThrow();
  });
});
