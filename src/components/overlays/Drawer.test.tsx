import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Drawer } from './Drawer';

/**
 * Contrato de acessibilidade da gaveta, conforme `docs/PLANO_MESTRE_DO_SITE.md` §6:
 * `aria-expanded`/`aria-controls`, foco entra, foco preso, `Esc` fecha, scrim fecha, fundo `inert`,
 * scroll travado e foco devolvido ao acionador.
 */
function Cenario() {
  const [aberto, setAberto] = useState(false);
  const acionador = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <p>Conteúdo do fundo</p>
      <button
        ref={acionador}
        type="button"
        aria-expanded={aberto}
        aria-controls="gaveta"
        onClick={() => setAberto(true)}
      >
        MENU
      </button>

      <Drawer
        id="gaveta"
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Índice do laboratório"
        variante="navegacao"
        acionador={acionador}
      >
        <a href="/projects/revalio" data-foco-inicial>
          Revalio
        </a>
        <a href="/about">Sobre</a>
      </Drawer>
    </div>
  );
}

describe('Drawer', () => {
  it('anuncia o estado no acionador', async () => {
    const usuario = userEvent.setup();
    render(<Cenario />);

    const acionador = screen.getByRole('button', { name: 'MENU' });
    expect(acionador).toHaveAttribute('aria-expanded', 'false');
    expect(acionador).toHaveAttribute('aria-controls', 'gaveta');

    await usuario.click(acionador);
    expect(acionador).toHaveAttribute('aria-expanded', 'true');
  });

  it('abre como diálogo modal rotulado e move o foco para dentro', async () => {
    const usuario = userEvent.setup();
    render(<Cenario />);

    await usuario.click(screen.getByRole('button', { name: 'MENU' }));

    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo).toHaveAccessibleName('Índice do laboratório');
    await waitFor(() => expect(screen.getByRole('link', { name: 'Revalio' })).toHaveFocus());
  });

  it('trava o scroll do fundo e torna o fundo inerte', async () => {
    const usuario = userEvent.setup();
    render(<Cenario />);

    await usuario.click(screen.getByRole('button', { name: 'MENU' }));

    expect(document.body.dataset['scrollLocked']).toBe('true');
    const fundo = screen.getByText('Conteúdo do fundo').closest('div');
    expect(fundo?.parentElement).toHaveAttribute('inert');
  });

  it('fecha com Esc e devolve o foco ao acionador', async () => {
    const usuario = userEvent.setup();
    render(<Cenario />);

    const acionador = screen.getByRole('button', { name: 'MENU' });
    await usuario.click(acionador);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await usuario.keyboard('{Escape}');

    await waitFor(() => expect(acionador).toHaveFocus());
    expect(acionador).toHaveAttribute('aria-expanded', 'false');
    expect(document.body.dataset['scrollLocked']).toBeUndefined();
  });

  it('fecha pelo botão explícito', async () => {
    const usuario = userEvent.setup();
    render(<Cenario />);

    await usuario.click(screen.getByRole('button', { name: 'MENU' }));
    await usuario.click(screen.getByRole('button', { name: /Fechar/ }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'MENU' })).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('mantém o foco circulando dentro da gaveta', async () => {
    const usuario = userEvent.setup();
    render(<Cenario />);

    await usuario.click(screen.getByRole('button', { name: 'MENU' }));
    await waitFor(() => expect(screen.getByRole('link', { name: 'Revalio' })).toHaveFocus());

    await usuario.tab();
    expect(screen.getByRole('link', { name: 'Sobre' })).toHaveFocus();

    // Do último foco, Tab volta para o primeiro: o foco não escapa para o fundo.
    await usuario.tab();
    expect(screen.getByRole('button', { name: /Fechar/ })).toHaveFocus();
    await usuario.tab();
    expect(screen.getByRole('link', { name: 'Revalio' })).toHaveFocus();
  });
});
