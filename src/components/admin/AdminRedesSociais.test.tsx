import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminRedesSociais } from './AdminRedesSociais';
import { REDES } from '@/lib/social/types';
import type { PainelSocial } from '@/lib/social/types';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe('publicação de imagem com legenda comum', () => {
  it('retira YouTube dos destinos e mantém o limite do X visível antes de enviar', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:teste');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const dados: PainelSocial = { armazenamento: true, avisos: [], publicacoes: [], provedores: { meta: true, youtube: true, twitter: true, tiktok: true },
      contas: REDES.map((rede) => ({ id: `${rede}:teste`, rede, nome: `Teste ${rede}`, disponivel: true, motivo: null })),
    };
    const usuario = userEvent.setup();
    render(<AdminRedesSociais inicial={dados} erroInicial="" conexao="" />);
    await usuario.upload(screen.getByLabelText('1. Escolha uma imagem ou um vídeo'), new File(['imagem-de-teste'], 'foto.jpg', { type: 'image/jpeg' }));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /YouTube/ })).toBeDisabled());
    expect(screen.getByRole('checkbox', { name: /YouTube/ })).not.toBeChecked();
    expect(screen.getByRole('button', { name: /PUBLICAR EM 4 REDES/ })).toBeDisabled();
    await usuario.type(screen.getByLabelText('2. Escreva a legenda'), 'Uma legenda para as redes.');
    expect(screen.getByRole('button', { name: /PUBLICAR EM 4 REDES/ })).toBeEnabled();
    expect(screen.getByText(/280.*caracteres/)).toBeInTheDocument();
    expect(screen.getByText(/No TikTok, você recebe o arquivo/)).toBeInTheDocument();
  });
});
