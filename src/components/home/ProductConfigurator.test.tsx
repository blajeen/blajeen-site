import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProductConfigurator } from './ProductConfigurator';

function paginaDa(aba: HTMLElement) {
  return document.getElementById(aba.getAttribute('aria-controls')!)!;
}

describe('ProductConfigurator', () => {
  it('mostra uma página do site demonstrativo por vez, no mesmo lugar', async () => {
    const usuario = userEvent.setup();
    render(<ProductConfigurator />);
    const menu = screen.getByRole('tablist', { name: 'Páginas do site demonstrativo' });
    const inicio = within(menu).getByRole('tab', { name: 'Início' });
    const avaliacoes = within(menu).getByRole('tab', { name: 'Avaliações' });

    expect(inicio).toHaveAttribute('aria-selected', 'true');
    expect(paginaDa(inicio)).not.toHaveAttribute('inert');
    expect(paginaDa(avaliacoes)).toHaveAttribute('inert');

    await usuario.click(avaliacoes);
    expect(avaliacoes).toHaveAttribute('aria-selected', 'true');
    expect(inicio).toHaveAttribute('aria-selected', 'false');
    expect(paginaDa(avaliacoes)).not.toHaveAttribute('inert');
    expect(paginaDa(inicio)).toHaveAttribute('inert');
    // A pilha continua com as quatro: é isso que segura a altura da prévia na troca.
    expect(paginaDa(inicio).parentElement!.children).toHaveLength(4);
  });

  it('troca de aba pelas setas, com só a aba atual no Tab', async () => {
    const usuario = userEvent.setup();
    render(<ProductConfigurator />);
    const abas = screen.getAllByRole('tab');

    expect(abas.map((aba) => aba.tabIndex)).toEqual([0, -1, -1, -1]);
    abas[0]!.focus();
    await usuario.keyboard('{ArrowRight}');
    expect(abas[1]).toHaveFocus();
    expect(abas[1]).toHaveAttribute('aria-selected', 'true');
    await usuario.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(abas[3]).toHaveFocus();
    await usuario.keyboard('{Home}');
    expect(abas[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('leva dos destaques ao catálogo, com o foco junto', async () => {
    const usuario = userEvent.setup();
    render(<ProductConfigurator />);

    await usuario.click(screen.getByRole('tab', { name: 'Destaques' }));
    await usuario.click(screen.getByRole('button', { name: /Explorar seleção/ }));

    expect(screen.getByRole('tab', { name: 'Início' })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(document.getElementById('demo-catalog')).toHaveFocus());
  });

  it('continua simulando o pedido na página Início', async () => {
    const usuario = userEvent.setup();
    render(<ProductConfigurator />);

    await usuario.click(screen.getByRole('button', { name: 'Adicionar Bowl da estação' }));
    await usuario.click(screen.getByRole('button', { name: /Simular pedido/ }));
    expect(screen.getByRole('status')).toHaveTextContent('R$ 38,00');
    expect(screen.getByRole('link', { name: /Quero um projeto assim/ })).toHaveAttribute(
      'href',
      expect.stringContaining('/crie-seu-projeto?ideia='),
    );
  });
});
