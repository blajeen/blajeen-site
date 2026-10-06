import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@/components/motion/MotionProvider';
import type { ComodoId } from '@/lib/torrelio/planta';
import { definirContextoDoApartamento, reiniciarPonte } from '../ponte';
import type { CenaApartamento, EstadoDoApartamento } from './3d/contrato';
import { ApartamentoDemo } from './ApartamentoDemo';

type CenaFalsa = CenaApartamento & { estados: EstadoDoApartamento[]; escolher(id: ComodoId | null): void };

function criarCenaFalsa(): CenaFalsa {
  const escolhas = new Set<(id: ComodoId | null) => void>();
  const estados: EstadoDoApartamento[] = [];
  const nada = () => () => {};
  return {
    estados,
    aplicar: (e) => estados.push(e),
    aoEscolher(f) {
      escolhas.add(f);
      return () => escolhas.delete(f);
    },
    aoPassar: nada,
    aoProjetarRotulos: nada,
    aoMudarRumo: nada,
    aoMudarContexto: nada,
    diagnostico: { quadros: 0, chamadas: 0, triangulos: 0 },
    descartar: vi.fn(),
    escolher: (id) => escolhas.forEach((f) => f(id)),
  };
}

const carga = vi.hoisted(() => ({ carregar: vi.fn() }));
vi.mock('./3d/carregar-apartamento', () => ({
  carregarApartamento: (host: HTMLElement, estado: EstadoDoApartamento) => carga.carregar(host, estado),
}));

function montar() {
  return render(
    <MotionProvider>
      <section id="apartamento">
        <h2 id="apartamento-titulo" tabIndex={-1}>
          A planta que vocês enviam vira maquete.
        </h2>
        <ApartamentoDemo />
      </section>
    </MotionProvider>,
  );
}

describe('ApartamentoDemo', () => {
  beforeEach(() => {
    reiniciarPonte();
    carga.carregar.mockReset();
  });
  afterEach(() => {
    act(() => reiniciarPonte());
  });

  it('mostra a planta técnica, a lista de cômodos e o quadro de áreas com os totais', () => {
    montar();
    expect(screen.getByRole('img', { name: 'Planta técnica do apartamento (fictícia)' })).toBeInTheDocument();
    const lista = screen.getByRole('list', { name: 'Cômodos' });
    expect(within(lista).getAllByRole('button')).toHaveLength(9);
    expect(within(lista).getByRole('button', { name: /^Banho da suíte/ })).toHaveAttribute('aria-pressed', 'false');
    const tabela = screen.getByRole('table', { name: /Quadro de áreas/ });
    expect(within(tabela).getByRole('row', { name: /Área útil.*57,61 m²/ })).toBeInTheDocument();
    expect(within(tabela).getByRole('row', { name: /Área privativa.*66,45 m²/ })).toBeInTheDocument();
    expect(screen.getByText(/Mobiliário ilustrativo\. As áreas são da planta fictícia; num projeto real, vêm do memorial da incorporadora\./)).toBeInTheDocument();
    // Sem pedido de ninguém, o 3D não carrega.
    expect(carga.carregar).not.toHaveBeenCalled();
  });

  it('alterna maquete e planta com aria-pressed e escolhe cômodos pela lista', async () => {
    const usuario = userEvent.setup();
    montar();
    const maquete = screen.getByRole('button', { name: 'Maquete' });
    const planta = screen.getByRole('button', { name: 'Planta' });
    expect(planta).toHaveAttribute('aria-pressed', 'true');
    expect(maquete).toHaveAttribute('aria-pressed', 'false');
    await usuario.click(maquete);
    expect(maquete).toHaveAttribute('aria-pressed', 'true');
    expect(planta).toHaveAttribute('aria-pressed', 'false');

    const suite = screen.getByRole('button', { name: /^Suíte/ });
    await usuario.click(suite);
    expect(suite).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Suíte: 8,68 m².')).toBeInTheDocument();
    await usuario.click(suite);
    expect(suite).toHaveAttribute('aria-pressed', 'false');
  });

  it('carrega a maquete só pelo botão e conversa com a cena nos dois sentidos', async () => {
    const usuario = userEvent.setup();
    const cena = criarCenaFalsa();
    carga.carregar.mockResolvedValue(cena);
    montar();
    await usuario.click(screen.getByRole('button', { name: /Abrir a maquete do apartamento/ }));
    expect(carga.carregar).toHaveBeenCalledTimes(1);
    expect(carga.carregar.mock.calls[0]![1]).toMatchObject({ modo: 'maquete', espelhada: false, norteGraus: 0, hora: 15, estacao: 'equinocio', movimento: true });
    await waitFor(() => expect(cena.estados.length).toBeGreaterThan(0));

    await usuario.click(screen.getByRole('button', { name: /^Dormitório/ }));
    await waitFor(() => expect(cena.estados.at(-1)?.selecionado).toBe('dormitorio'));
    await usuario.click(screen.getByRole('button', { name: 'Girar planta' }));
    await waitFor(() => expect(cena.estados.at(-1)?.giro).toBe(90));

    // Clique num piso da maquete: a lista acompanha.
    act(() => cena.escolher('cozinha'));
    expect(screen.getByRole('button', { name: /^Cozinha/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: /Abrir a maquete do apartamento/ })).not.toBeInTheDocument();
  });

  it('avisa quando o 3D não abre, e a planta e o quadro continuam valendo', async () => {
    const usuario = userEvent.setup();
    carga.carregar.mockRejectedValue(new Error('sem WebGL'));
    montar();
    await usuario.click(screen.getByRole('button', { name: /Abrir a maquete do apartamento/ }));
    expect(await screen.findByText('Seu navegador não abriu o 3D. A planta e o quadro de áreas continuam valendo.')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /Quadro de áreas/ })).toBeInTheDocument();
  });

  it('mostra o final 03 espelhado, com o sol da torre, e põe o foco no título a cada pedido', async () => {
    const cena = criarCenaFalsa();
    carga.carregar.mockResolvedValue(cena);
    const usuario = userEvent.setup();
    montar();
    await usuario.click(screen.getByRole('button', { name: /Abrir a maquete do apartamento/ }));
    await waitFor(() => expect(cena.estados.length).toBeGreaterThan(0));

    act(() => definirContextoDoApartamento({ unidade: { id: '1803', final: '03', tipologia: 'tipo-2d' }, hora: 20.5, estacao: 'inverno' }, true));
    expect(screen.getByText('Unidade 1803 · final 03 · planta espelhada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para a torre/ })).toHaveAttribute('href', '#demonstracao');
    expect(document.getElementById('apartamento-titulo')).toHaveFocus();
    await waitFor(() => expect(cena.estados.at(-1)).toMatchObject({ espelhada: true, norteGraus: 180, hora: 20.5, estacao: 'inverno' }));
    expect(screen.getByRole('button', { name: 'Noite' })).toHaveAttribute('aria-pressed', 'true');

    act(() => definirContextoDoApartamento({ unidade: { id: '702', final: '02', tipologia: 'tipo-2d' } }, true));
    expect(screen.getByText('Unidade 702 · final 02 · planta-base')).toBeInTheDocument();
  });

  it('explica que só a tipologia de 2 dormitórios tem planta 3D', () => {
    montar();
    act(() => definirContextoDoApartamento({ unidade: { id: '1801', final: '01', tipologia: 'tipo-3d' } }, true));
    expect(screen.getByText(/A demonstração tem a planta 3D só da tipologia de 2 dormitórios/)).toBeInTheDocument();
    expect(screen.getByText('Unidade 1801 · final 01 · 3 dormitórios')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Suíte/ })).toHaveLength(1);
  });

  it('não pede animação com movimento reduzido', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((consulta: string) => ({ ...original(consulta), matches: consulta.includes('reduce') })) as typeof window.matchMedia;
    try {
      const cena = criarCenaFalsa();
      carga.carregar.mockResolvedValue(cena);
      const usuario = userEvent.setup();
      montar();
      await usuario.click(screen.getByRole('button', { name: /Abrir a maquete do apartamento/ }));
      expect(carga.carregar.mock.calls[0]![1]).toMatchObject({ movimento: false });
    } finally {
      window.matchMedia = original;
    }
  });
});
