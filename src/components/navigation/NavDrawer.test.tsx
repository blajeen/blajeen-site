import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavDrawer } from './NavDrawer';

let caminhoAtual = '/';
vi.mock('next/navigation', () => ({ usePathname: () => caminhoAtual }));

function abrir(aoFechar = vi.fn()) {
  render(
    <NavDrawer id="menu" aberto aoFechar={aoFechar} acionador={createRef<HTMLButtonElement>()} />,
  );
  return within(screen.getByRole('navigation', { name: 'Navegação principal' }));
}

describe('NavDrawer', () => {
  beforeEach(() => {
    caminhoAtual = '/';
  });

  it('abre recolhido, com todos os destinos numa lista só', () => {
    const indice = abrir();

    for (const rotulo of ['Início', 'Crie seu projeto', 'Projetos feitos', 'Estúdio', 'Novidades', 'Contato']) {
      expect(indice.getByRole('link', { name: rotulo })).toBeInTheDocument();
    }
    for (const rotulo of ['Produtos', 'SaaS', 'Jogos']) {
      expect(indice.getByRole('button', { name: rotulo })).toHaveAttribute('aria-expanded', 'false');
    }
    expect(indice.queryByRole('link', { name: /^Revalio/ })).not.toBeInTheDocument();
  });

  it('leva o foco pro índice sem pré-selecionar nenhum destino', async () => {
    abrir();
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });

    await waitFor(() => expect(nav).toHaveFocus());
    await userEvent.tab();
    expect(within(nav).getByRole('link', { name: 'Início' })).toHaveFocus();
  });

  it('desdobra uma lista por vez, no lugar', async () => {
    const usuario = userEvent.setup();
    const indice = abrir();
    const jogos = indice.getByRole('button', { name: 'Jogos' });
    const produtos = indice.getByRole('button', { name: 'Produtos' });

    await usuario.click(jogos);
    expect(jogos).toHaveAttribute('aria-expanded', 'true');
    const lista = document.getElementById(jogos.getAttribute('aria-controls')!)!;
    expect(within(lista).getByRole('link', { name: /^Revalio/ })).toBeVisible();
    expect(within(lista).getByRole('link', { name: /^Morvelio Wiki/ })).toBeVisible();

    await usuario.click(produtos);
    expect(produtos).toHaveAttribute('aria-expanded', 'true');
    expect(jogos).toHaveAttribute('aria-expanded', 'false');
    expect(indice.queryByRole('link', { name: /^Revalio/ })).not.toBeInTheDocument();
    expect(indice.getByRole('link', { name: /Ver todos os produtos/ })).toBeVisible();

    await usuario.click(produtos);
    expect(produtos).toHaveAttribute('aria-expanded', 'false');
  });

  it('marca a seção e a página onde a pessoa está', async () => {
    caminhoAtual = '/projects/revalio';
    const usuario = userEvent.setup();
    const indice = abrir();
    const jogos = indice.getByRole('button', { name: 'Jogos' });

    expect(jogos).toHaveAttribute('data-ativo');
    await usuario.click(jogos);
    expect(indice.getByRole('link', { name: /^Revalio/ })).toHaveAttribute('aria-current', 'page');
  });

  it('fecha a gaveta ao escolher um destino', async () => {
    const usuario = userEvent.setup();
    const aoFechar = vi.fn();
    const indice = abrir(aoFechar);

    await usuario.click(indice.getByRole('button', { name: 'SaaS' }));
    await usuario.click(indice.getByRole('link', { name: /Ver todos os sistemas/ }));
    expect(aoFechar).toHaveBeenCalled();
  });

  it('mantém suporte, políticas e exclusão de dados ao alcance', () => {
    abrir();
    const dialogo = within(screen.getByRole('dialog'));

    expect(dialogo.getByRole('link', { name: 'Suporte' })).toHaveAttribute('href', '/support');
    expect(dialogo.getByRole('link', { name: 'Privacidade' })).toHaveAttribute('href', '/privacy');
    expect(dialogo.getByRole('link', { name: 'Termos' })).toHaveAttribute('href', '/terms');
    expect(dialogo.getByRole('link', { name: 'Socialio' })).toHaveAttribute(
      'href',
      '/socialio/delete-account',
    );
  });
});
