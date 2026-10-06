import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { LUZ } from '@/lib/torrelio/luz';
import { UNIDADES } from '@/lib/torrelio/predio';
import { criarCenaFalsa, type CenaFalsa } from './3d/falsa';
import { DemonstracaoTorrelio } from './DemonstracaoTorrelio';
import { reiniciarLoja } from './loja';

const { carregar } = vi.hoisted(() => ({ carregar: vi.fn() }));
vi.mock('./3d/carregar', () => ({ carregarTorre: carregar }));

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

  it('abre a vista no fim de tarde se a maquete está à noite, e o prédio reacende ao voltar', async () => {
    montar();
    await abrir3d();
    expect(cena.ultimoEstado!.hora).toBe(20.5);
    fireEvent.click(screen.getByRole('button', { name: /Ver a vista desta unidade/ }));
    await waitFor(() => expect(cena.ultimoEstado!.hora).toBe(17.5));
    const hora = screen.getByRole('group', { name: 'Hora do dia' });
    expect(within(hora).getByRole('button', { name: 'Fim de tarde' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Voltar para o prédio/ }));
    await waitFor(() => expect(cena.ultimoEstado!.hora).toBe(20.5));
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
