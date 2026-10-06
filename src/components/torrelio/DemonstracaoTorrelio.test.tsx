import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { LUZ } from '@/lib/torrelio/luz';
import { UNIDADES } from '@/lib/torrelio/predio';
import { criarCenaFalsa, type CenaFalsa } from './3d/falsa';
import type { CenaHolograma, EstadoDoHolograma } from './3d/holograma';
import { DemonstracaoTorrelio } from './DemonstracaoTorrelio';
import { obterLoja, reiniciarLoja } from './loja';

const { carregar, carregarHolograma } = vi.hoisted(() => ({ carregar: vi.fn(), carregarHolograma: vi.fn() }));
vi.mock('./3d/carregar', () => ({ carregarTorre: carregar }));
vi.mock('./3d/carregar-holograma', () => ({ carregarHolograma }));

/** Um holograma de mentira: guarda cada estado que a interface manda. */
let holograma: { estados: EstadoDoHolograma[]; descartado: boolean };

let cena: CenaFalsa;
const indice = (id: string) => UNIDADES.findIndex((u) => u.id === id);

function montar() {
  return render(
    <MotionProvider>
      <DemonstracaoTorrelio />
    </MotionProvider>,
  );
}

/** Abre o 3D pelo botão; se a escolha de uma unidade já pediu a carga, só espera. */
async function abrir3d() {
  const botao = screen.queryByRole('button', { name: /Abrir a maquete 3D/ });
  if (botao) fireEvent.click(botao);
  await waitFor(() => expect(cena.ultimoEstado).not.toBeNull());
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('a demonstração do Torrelio', () => {
  beforeEach(() => {
    // A demonstração escreve a escolha na URL; cada teste começa da página limpa.
    window.history.replaceState(null, '', '/produtos/torrelio');
    window.localStorage.clear();
    reiniciarLoja();
    cena = criarCenaFalsa();
    carregar.mockReset();
    carregar.mockImplementation(async () => cena);
    carregarHolograma.mockReset();
    carregarHolograma.mockImplementation(async (_host: HTMLElement, inicial: EstadoDoHolograma): Promise<CenaHolograma> => {
      holograma = { estados: [inicial], descartado: false };
      return {
        aplicar: (estado) => void holograma.estados.push(estado),
        gravar: async () => null,
        pararGravacao: () => {},
        aoMudarContexto: () => () => {},
        descartar: () => {
          holograma.descartado = true;
        },
      };
    });
  });
  afterEach(() => reiniciarLoja());

  it('abre na 1803, com espelho e cartão, sem carregar o 3D', () => {
    montar();
    expect(screen.getByRole('heading', { name: '1803' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: /Espelho por pavimento/ })).toBeInTheDocument();
    expect(screen.getByText('VENDIDO').parentElement).toHaveTextContent('55,4%');
    expect(carregar).not.toHaveBeenCalled();
  });

  it('carrega o 3D uma vez só, mesmo trocando de aba e de modo, e manda a escolha para a cena', async () => {
    montar();
    await abrir3d();
    expect(cena.ultimoEstado!.selecionada).toBe(indice('1803'));
    fireEvent.click(screen.getByRole('tab', { name: 'Painel de controle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hotel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Incorporadora' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Visão do cliente' }));
    await waitFor(() => expect(cena.ultimoEstado!.modo).toBe('incorporadora'));
    expect(carregar).toHaveBeenCalledTimes(1);
    expect(cena.descartada).toBe(false);
  });

  it('troca o cartão ao escolher no espelho e ao clicar numa janela da torre', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: /^Apartamento 1902,/ }));
    expect(screen.getByRole('heading', { name: '1902' })).toBeInTheDocument();
    await abrir3d();
    act(() => cena.escolher(indice('1204')));
    expect(screen.getByRole('heading', { name: '1204' })).toBeInTheDocument();
    await waitFor(() => expect(cena.ultimoEstado!.selecionada).toBe(indice('1204')));
  });

  it('marca a venda no painel: a luz acende na cena, o percentual sobe, e dá para desfazer', async () => {
    montar();
    await abrir3d();
    fireEvent.click(screen.getByRole('tab', { name: 'Painel de controle' }));
    const status = screen.getByRole('group', { name: 'Status' });
    fireEvent.click(within(status).getByLabelText('vendida'));
    await waitFor(() => expect(cena.ultimoEstado!.luzes[indice('1803')]).toBe(LUZ.acesa));
    fireEvent.click(screen.getByRole('tab', { name: 'Histórico' }));
    expect(screen.getByText('Unidade 1803 marcada como vendida')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    await waitFor(() => expect(cena.ultimoEstado!.luzes[indice('1803')]).toBe(LUZ.apagada));
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Seções do painel' })).getByRole('tab', { name: 'Unidades' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'Status' })).getByLabelText('vendida'));
    fireEvent.click(screen.getByRole('tab', { name: 'Visão do cliente' }));
    expect(screen.getByText('VENDIDO').parentElement).toHaveTextContent('56,8%');
  });

  it('restaura só depois de confirmar', async () => {
    montar();
    fireEvent.click(screen.getByRole('tab', { name: 'Painel de controle' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'Status' })).getByLabelText('vendida'));
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar demonstração' }));
    expect(screen.getByRole('group', { name: 'Confirmar restauração' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar' }));
    expect(within(screen.getByRole('group', { name: 'Status' })).getByLabelText('disponível')).toBeChecked();
  });

  it('guarda as mudanças no navegador e as relê ao voltar', async () => {
    const { unmount } = montar();
    fireEvent.click(screen.getByRole('tab', { name: 'Painel de controle' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'Status' })).getByLabelText('reservada'));
    await esperar(250);
    unmount();
    // Recarregar a página sem a consulta: a loja relê o armazenamento.
    window.history.replaceState(null, '', '/produtos/torrelio');
    reiniciarLoja();
    montar();
    await waitFor(() => expect(screen.getByRole('heading', { name: '1803' }).closest('article')).toHaveTextContent('reservada'));
  });

  it('põe as ações no topo do cartão, antes dos valores, e navega pelas disponíveis', () => {
    montar();
    const cartao = screen.getByRole('heading', { name: '1803' }).closest('article')!;
    const vista = within(cartao).getByRole('button', { name: /Ver a vista desta unidade/ });
    const fluxo = within(cartao).getByRole('table', { name: /Fluxo de pagamento/ });
    // No fim do cartão as ações ficavam escondidas pela rolagem: agora vêm antes dos valores.
    expect(vista.compareDocumentPosition(fluxo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(cartao).getByRole('button', { name: /Ver por dentro/ })).toBeInTheDocument();
    expect(within(cartao).getByRole('button', { name: 'Compartilhar' })).toBeInTheDocument();
    const navegar = () => within(screen.getByRole('group', { name: 'Navegar pelas disponíveis' }));
    fireEvent.click(navegar().getByRole('button', { name: 'Próxima disponível' }));
    expect(screen.getByRole('heading', { name: '1901' })).toBeInTheDocument();
    fireEvent.click(navegar().getByRole('button', { name: 'Disponível anterior' }));
    expect(screen.getByRole('heading', { name: '1803' })).toBeInTheDocument();
  });

  it('no celular, a barra da escolha acompanha a unidade tocada no espelho', () => {
    montar();
    const barra = () => screen.getByRole('group', { name: 'Escolha atual', hidden: true });
    expect(barra()).toHaveTextContent('1803');
    expect(barra()).toHaveTextContent('disponível · R$ 785.619,74');
    fireEvent.click(screen.getByRole('button', { name: /^Apartamento 1902,/ }));
    expect(barra()).toHaveTextContent('1902');
  });

  it('abre a vista da unidade, põe o foco em Voltar e sai com Esc', async () => {
    montar();
    await abrir3d();
    fireEvent.click(screen.getByRole('button', { name: /Ver a vista desta unidade/ }));
    await waitFor(() => expect(cena.chamadas.some((c) => c.metodo === 'verVista')).toBe(true));
    expect(screen.getByRole('heading', { name: /Vista do 1803 · fundos \(sul\)/ })).toBeInTheDocument();
    expect(document.activeElement).toHaveTextContent('Voltar para o prédio');
    fireEvent.click(screen.getByRole('button', { name: /Subir: 1903/ }));
    await waitFor(() => expect(cena.chamadas.some((c) => c.metodo === 'mudarAndarDaVista')).toBe(true));
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(cena.chamadas.some((c) => c.metodo === 'voltarAoPredio')).toBe(true));
  });

  it('abre de dia; a noite só quando a pessoa troca', async () => {
    montar();
    await abrir3d();
    expect(cena.ultimoEstado!.hora).toBe(10);
    // De dia, o contorno das disponíveis fica ligado.
    expect(cena.ultimoEstado!.contornar).toBe(true);
  });

  it('abre a vista no fim de tarde se a maquete está à noite, e o prédio reacende ao voltar', async () => {
    montar();
    await abrir3d();
    fireEvent.click(within(screen.getByRole('group', { name: 'Hora do dia' })).getByRole('button', { name: 'Noite' }));
    await waitFor(() => expect(cena.ultimoEstado!.hora).toBe(20.5));
    fireEvent.click(screen.getByRole('button', { name: /Ver a vista desta unidade/ }));
    await waitFor(() => expect(cena.ultimoEstado!.hora).toBe(17.5));
    const hora = screen.getByRole('group', { name: 'Hora do dia' });
    expect(within(hora).getByRole('button', { name: 'Fim de tarde' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Voltar para o prédio/ }));
    await waitFor(() => expect(cena.ultimoEstado!.hora).toBe(20.5));
  });

  it('abre o holograma em pirâmide, troca para vitrine, acende a venda e fecha com Esc, devolvendo o foco', async () => {
    montar();
    const botao = screen.getByRole('button', { name: 'Holograma' });
    botao.focus();
    fireEvent.click(botao);
    const dialogo = await screen.findByRole('dialog', { name: 'Modo holograma' });
    await waitFor(() => expect(holograma.estados.at(-1)!.layout).toBe('piramide'));
    expect(carregarHolograma).toHaveBeenCalledTimes(1);
    // Abre girando; o mesmo botão para e volta a girar.
    expect(holograma.estados.at(-1)!.girando).toBe(true);
    const girar = within(dialogo).getByRole('button', { name: 'Girar' });
    expect(girar).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(girar);
    await waitFor(() => expect(holograma.estados.at(-1)!.girando).toBe(false));
    fireEvent.click(girar);
    await waitFor(() => expect(holograma.estados.at(-1)!.girando).toBe(true));
    // O holograma não carrega a maquete de baixo, e o endereço abre direto nele.
    expect(carregar).not.toHaveBeenCalled();
    expect(window.location.search).toContain('holograma=piramide');
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Vitrine' }));
    await waitFor(() => expect(holograma.estados.at(-1)!.layout).toBe('vitrine'));
    // Uma venda (no painel desta ou de outra janela do navegador) acende no holograma.
    act(() => obterLoja().despachar({ tipo: 'unidade/status', ids: ['1803'], status: 'vendida', quando: '2026-10-06T15:00:00.000Z' }));
    await waitFor(() => expect(holograma.estados.at(-1)!.luzes[indice('1803')]).toBe(LUZ.acesa));
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Modo holograma' })).toBeNull());
    expect(holograma.descartado).toBe(true);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Holograma' })));
    expect(window.location.search).not.toContain('holograma');
  });

  it('abre direto no holograma pelo link do stand', async () => {
    window.history.replaceState(null, '', '/produtos/torrelio?holograma=vitrine');
    montar();
    await screen.findByRole('dialog', { name: 'Modo holograma' });
    await waitFor(() => expect(holograma.estados.at(-1)!.layout).toBe('vitrine'));
  });

  it('com movimento reduzido, o holograma abre parado, diz por quê e gira no botão Girar', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((consulta: string) => ({ ...original(consulta), matches: consulta.includes('reduce') })) as typeof window.matchMedia;
    try {
      window.history.replaceState(null, '', '/produtos/torrelio?holograma=piramide');
      montar();
      const dialogo = await screen.findByRole('dialog', { name: 'Modo holograma' });
      await waitFor(() => expect(holograma.estados.at(-1)!.movimento).toBe(false));
      expect(holograma.estados.at(-1)!.girando).toBe(false);
      expect(within(dialogo).getByText(/Movimento reduzido neste aparelho: toque em Girar/)).toBeInTheDocument();
      // Parado pela preferência, os controles não somem: a dica e o botão ficam à vista.
      expect(dialogo).toHaveAttribute('data-ocioso', 'nao');
      const girar = within(dialogo).getByRole('button', { name: 'Girar' });
      expect(girar).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(girar);
      await waitFor(() => expect(holograma.estados.at(-1)!.girando).toBe(true));
      expect(girar).toHaveAttribute('aria-pressed', 'true');
      // As luzes continuam sem transição: girar foi escolha de quem olha, o resto segue a preferência.
      expect(holograma.estados.at(-1)!.movimento).toBe(false);
      expect(within(dialogo).queryByText(/Movimento reduzido/)).toBeNull();
      expect(within(dialogo).getByRole('button', { name: /Gravar vídeo/ })).toBeInTheDocument();
    } finally {
      window.matchMedia = original;
    }
  });

  it('respeita o movimento reduzido do sistema', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((consulta: string) => ({ ...original(consulta), matches: consulta.includes('reduce') })) as typeof window.matchMedia;
    try {
      montar();
      await abrir3d();
      expect(cena.ultimoEstado!.movimento).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });

  it('se o 3D falhar, avisa, e o espelho e o cartão continuam funcionando', async () => {
    carregar.mockRejectedValueOnce(new Error('sem WebGL'));
    montar();
    fireEvent.click(screen.getByRole('button', { name: /Abrir a maquete 3D/ }));
    expect(await screen.findByText(/Seu navegador não abriu o 3D/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Apartamento 1501,/ }));
    expect(screen.getByRole('heading', { name: '1501' })).toBeInTheDocument();
  });

  it('no hotel, reserva sem pedir nenhum dado pessoal', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Hotel' }));
    const reservar = await screen.findByRole('button', { name: 'Reservar (demonstração)' });
    expect(document.querySelector('input[type="email"], input[type="tel"], input[autocomplete="name"]')).toBeNull();
    expect(screen.queryByLabelText(/nome|e-mail|telefone|cpf/i)).toBeNull();
    fireEvent.click(reservar);
    expect(await screen.findByText(/Reserva de demonstração feita/)).toBeInTheDocument();
  });
});
