import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { saas, saasEmBreve, obterSaas, avisoDemonstracao } from './saas';
import { atalhosDeProjeto, rodape } from './navigation';
import { novidades } from './news';
import { ROTAS } from '@/lib/routes';

describe('catálogo SaaS atualizado', () => {
  it('apresenta os seis produtos ativos e preserva o Pipelio em breve', () => {
    expect(saas.map((p) => p.nome)).toEqual(['Doutelio', 'Beautelio', 'Barbelio', 'Studelio', 'Foodelio', 'Lojalio']);
    expect(saas.every((p) => p.estado === 'ATIVO · DISPONÍVEL')).toBe(true);
    expect(saasEmBreve).toMatchObject({ nome: 'Pipelio', estado: 'EM BREVE', rota: ROTAS.pipelio });
    expect(() => obterSaas('inexistente')).toThrow();
  });

  it('usa os endereços do produto e da demo informados pelo proprietário', () => {
    expect(saas.map((p) => [p.site, p.demo])).toEqual([
      ['https://doutelio.com.br', 'https://doutelio.com.br/demo'],
      ['https://site-beautelio.vercel.app', 'https://site-beautelio.vercel.app/loja'],
      ['https://site-barbelio.vercel.app', 'https://site-barbelio.vercel.app/barbearia-aurora-demo'],
      ['https://site-studelio.vercel.app', 'https://site-studelio.vercel.app/estudio/studio-move-demo'],
      ['https://site-foodelio.vercel.app', 'https://site-foodelio.vercel.app/cardapio/sabor-da-vila-demo'],
      ['https://site-lojalio.vercel.app', 'https://site-lojalio.vercel.app/loja'],
    ]);
  });

  it('mantém três imagens locais e distintas, sem repetir a capa na galeria', () => {
    const hashes = new Set<string>();
    for (const produto of saas) {
      expect(produto.imagens).toHaveLength(3);
      expect(new Set(produto.imagens.map((i) => i.src)).size).toBe(3);
      for (const imagem of produto.imagens) {
        const arquivo = path.join(process.cwd(), 'public', imagem.src);
        expect(existsSync(arquivo), imagem.src).toBe(true);
        const bytes = readFileSync(arquivo);
        expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
        expect(bytes.byteLength).toBeLessThan(250_000);
        hashes.add(bytes.toString('base64'));
        expect(imagem.titulo.length).toBeGreaterThan(10);
        expect(imagem.descricao.length).toBeGreaterThan(30);
      }
    }
    expect(hashes.size).toBe(18);
  });

  it('distingue imagens ilustrativas e dados fictícios de capturas da demo', () => {
    expect(avisoDemonstracao).toMatch(/dados, fotos, preços e operações fictícios/);
    for (const produto of saas) {
      expect(produto.imagens[0].tipo).toBe('Demonstração do produto');
      if (produto.id !== 'doutelio') {
        expect(produto.imagens.slice(1).every((i) => i.tipo === 'Prévia ilustrativa do painel')).toBe(true);
      }
    }
  });

  it('sincroniza os estados do menu e os links do rodapé com o catálogo', () => {
    for (const produto of saas) {
      expect(atalhosDeProjeto).toContainEqual({ rotulo: produto.nome, estado: produto.estado, simbolo: produto.icone, href: produto.rota });
      expect(rodape.projetos).toContainEqual({ rotulo: produto.nome, href: produto.rota });
      expect(produto.publico).toMatch(/^Para /);
      expect(produto.recursos).toHaveLength(4);
      const wrapper = readFileSync(path.join(process.cwd(), 'src/app', produto.rota, 'page.tsx'), 'utf8');
      expect(wrapper).toContain(`obterSaas('${produto.id}')`);
      expect(wrapper).not.toMatch(/UpcomingProductPage|ProductGallery/);
    }
    expect(atalhosDeProjeto.filter((p) => p.estado === 'EM BREVE').map((p) => p.rotulo)).toEqual(['Pipelio']);
  });

  it('mantém o agendamento do Barbelio como pedido sem conta, não confirmação automática', () => {
    expect(obterSaas('barbelio').recursos.map((r) => r.texto).join(' ')).toMatch(/sem precisar criar uma conta/);
    expect(obterSaas('barbelio').observacao).toMatch(/não representa confirmação automática/);
  });

  it('publica um anúncio atual sem apagar o histórico das novidades', () => {
    expect(novidades.find((n) => n.id === 'saas-ativos-setembro-2026')).toMatchObject({ data: '2026-09-02', href: ROTAS.projetos });
    expect(novidades.some((n) => n.id === 'clinica-medica-em-desenvolvimento')).toBe(true);
  });
});
