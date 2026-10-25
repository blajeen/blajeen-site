import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminShell } from './AdminShell';

const navigation = vi.hoisted(() => ({ pathname: '/admin', push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push, refresh: navigation.refresh }),
}));

function renderShell() {
  render(<AdminShell titulo="Painel" descricao="Gerencie o site."><p>Conteúdo da seção</p></AdminShell>);
}

beforeEach(() => {
  navigation.pathname = '/admin';
  navigation.push.mockReset();
  navigation.refresh.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

describe('navegação do painel', () => {
  it('marca a seção da subrota e mantém a visão geral inativa', () => {
    navigation.pathname = '/admin/loja/produtos';
    renderShell();
    expect(screen.getByRole('link', { name: 'Loja' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current');
  });

  it('não marca uma seção cujo prefixo só é parecido', () => {
    navigation.pathname = '/admin/loja-outra';
    renderShell();
    expect(screen.getByRole('link', { name: 'Loja' })).not.toHaveAttribute('aria-current');
  });

  it('marca somente a visão geral na raiz do painel', () => {
    renderShell();
    expect(screen.getByRole('link', { name: 'Visão geral' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Loja' })).not.toHaveAttribute('aria-current');
  });
});

describe('saída do painel', () => {
  it.each(['http', 'network'])('permanece no painel e permite tentar novamente em falha %s', async (failure) => {
    const fetchMock = vi.fn();
    if (failure === 'http') fetchMock.mockResolvedValue({ ok: false });
    else fetchMock.mockRejectedValue(new Error('Sem conexão'));
    vi.stubGlobal('fetch', fetchMock);
    renderShell();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Sair do painel' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível sair. Tente novamente.');
    expect(navigation.push).not.toHaveBeenCalled();
    expect(navigation.refresh).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sair do painel' })).toBeEnabled();
    expect(screen.getByText('Conteúdo da seção')).toBeInTheDocument();
  });

  it('vai ao login e atualiza a sessão após a saída confirmada', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    renderShell();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Sair do painel' }));
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith('/admin/login'));
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/logout', { method: 'POST' });
    expect(navigation.refresh).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
