import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { saas } from '@/content/saas';
import { SaasProductPage } from './SaasProductPage';
import { SaasCard } from './SaasCard';

describe('apresentação dos SaaS', () => {
  it.each(saas)('$nome: mostra três imagens, público e acessos distintos', (produto) => {
    render(<SaasProductPage produto={produto} />);
    expect(screen.getByRole('heading', { level: 1, name: produto.nome })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByText(produto.publico)).toBeInTheDocument();
    const acesso = screen.getByRole('link', { name: `Acessar ${produto.nome} (nova aba)` });
    const demo = screen.getByRole('link', { name: `Abrir demonstração de ${produto.nome} (nova aba)` });
    expect(acesso).toHaveAttribute('href', produto.site);
    expect(demo).toHaveAttribute('href', produto.demo);
    for (const link of [acesso, demo]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(screen.getAllByRole('link', { name: /Ampliar imagem/ })).toHaveLength(3);
    expect(screen.getByText(/dados, fotos, preços e operações fictícios/)).toBeInTheDocument();
  });

  it('cada card tem nome, segmento, estado, capa e links de produto e demo', () => {
    render(<>{saas.map((produto) => <SaasCard key={produto.id} produto={produto} nivel={2} />)}</>);
    expect(screen.getAllByRole('article')).toHaveLength(6);
    for (const [i, produto] of saas.entries()) {
      const card = within(screen.getAllByRole('article')[i]!);
      expect(card.getByRole('heading', { level: 2, name: produto.nome })).toBeInTheDocument();
      expect(card.getByText('Ativo · Disponível')).toBeInTheDocument();
      expect(card.getByText(produto.segmento)).toBeInTheDocument();
      expect(card.getAllByRole('img')).toHaveLength(1);
      expect(card.getByRole('link', { name: `Abrir demonstração de ${produto.nome} (nova aba)` })).toHaveAttribute('href', produto.demo);
    }
  });
});
