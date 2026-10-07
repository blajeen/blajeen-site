import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@/components/motion/MotionProvider';
import type { CenaCarro, EstadoVisualCarro, ManifestoDoModelo } from '../3d/contrato';
import { DemonstracaoCarrelio } from '../DemonstracaoCarrelio';
import { reiniciarLoja } from '../loja';
import { EVENTO_DE_COMANDO } from '../VerNaDemonstracao';

const { carregar } = vi.hoisted(() => ({ carregar: vi.fn() }));
vi.mock('../3d/carregar', () => ({ carregarCarro: carregar }));

/** Um modelo sem interior, como o carro gerado no Tripo: por dentro, a demonstração mostra a foto. */
vi.mock('../3d/modelos', () => {
  const modelo: ManifestoDoModelo = {
    id: 'teste-sem-interior',
    url: '/produtos/carrelio/modelos/teste.glb',
    credito: 'Carro de teste, CC BY 4.0.',
    provisorio: false,
    comprimentoM: 4.38,
    pintura: ['Paint'],
    teto: [],
    rack: [],
    farois: [],
    lanternas: [],
    esconder: [],
    portas: {},
    pontos: { farois: [0.7, 0.7, 2] },
    interior: {},
  };
  return { MODELO_ATUAL: modelo };
});

let estados: EstadoVisualCarro[] = [];

function montar() {
  return render(
    <MotionProvider>
      <DemonstracaoCarrelio />
    </MotionProvider>,
  );
}

const barra = () => screen.getByRole('group', { name: 'Controles do carro' });

describe('o carro por dentro, em foto', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/produtos/carrelio');
    window.localStorage.clear();
    reiniciarLoja();
    estados = [];
    carregar.mockReset();
    carregar.mockImplementation(async (_host: HTMLElement, opcoes: { estado: EstadoVisualCarro }): Promise<CenaCarro> => {
      estados.push(opcoes.estado);
      return {
        aplicar: (estado) => void estados.push(estado),
        enquadrar: () => {},
        zoom: () => {},
        definirAreaLivre: () => {},
        aoProjetar: () => () => {},
        aoTocarPeca: () => () => {},
        aoArrastar: () => () => {},
        aoMudarContexto: () => () => {},
        exportarUsdz: async () => null,
        diagnostico: { quadros: 0, chamadas: 0, triangulos: 0 },
        descartar: () => {},
      };
    });
  });
  afterEach(() => reiniciarLoja());

  it('sem interior no 3D, "Por dentro" abre a foto, e o 3D fica por fora, parado', async () => {
    montar();
    // A foto só é montada quando a pessoa entra.
    expect(screen.queryByRole('img', { name: /O interior do Jaecoo 5/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Entrar no carro/ }));
    expect(await screen.findByRole('img', { name: /O interior do Jaecoo 5/ })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Interior do carro/ })).toBeInTheDocument();
    // Faróis, girar e a garagem não fazem sentido por dentro; a noite, sim, e o "Por fora" sai.
    expect(within(barra()).queryByRole('button', { name: 'Faróis' })).toBeNull();
    expect(within(barra()).queryByRole('button', { name: 'Girar' })).toBeNull();
    expect(within(barra()).queryByRole('button', { name: 'Na sua garagem' })).toBeNull();
    expect(within(barra()).getByRole('button', { name: 'Noite' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Entrar no carro/ })).toBeNull();
    // O 3D (carregado ao entrar) recebe a vista de fora, sem girar.
    await waitFor(() => expect(estados.at(-1)).toMatchObject({ vista: 'fora', girando: false }));
    expect(screen.getByText('Imagem ilustrativa · foto de divulgação Jaecoo')).toBeInTheDocument();
  });

  it('os pontos da foto têm o texto da versão, e o que a Comfort não tem diz de qual versão é', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: /Entrar no carro/ }));
    const destaques = await screen.findByRole('group', { name: 'Destaques por dentro' });
    expect(within(destaques).getByRole('button', { name: 'Multimídia: Tela de 13,2".', hidden: true })).toBeInTheDocument();
    expect(within(destaques).getByRole('button', { name: 'Luz ambiente: Personalizável, no painel e nas portas.', hidden: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Comfort' }));
    expect(within(destaques).getByRole('button', { name: 'Multimídia: Tela de 9".', hidden: true })).toBeInTheDocument();
    expect(within(destaques).getByRole('button', { name: 'Carregador: Só na Prestige.', hidden: true })).toBeInTheDocument();
    // Na Comfort, a fileira de cores dá lugar ao aviso, que leva à Prestige.
    expect(screen.queryByRole('radio', { name: 'Roxo' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ver na Prestige' }));
    expect(screen.getByRole('button', { name: 'Prestige' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('radio', { name: 'Roxo' })).toBeInTheDocument();
  });

  it('troca a cor da luz ambiente e acende a noite por dentro; o endereço acompanha', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: /Entrar no carro/ }));
    const azul = await screen.findByRole('radio', { name: 'Azul' });
    expect(azul).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Âmbar' }));
    expect(screen.getByRole('radio', { name: 'Âmbar' })).toBeChecked();
    const interior = screen.getByRole('group', { name: /Interior do carro/ }).parentElement!;
    expect(interior.style.getPropertyValue('--luz')).toBe('#ffae2b');
    fireEvent.click(within(barra()).getByRole('button', { name: 'Noite' }));
    expect(interior).toHaveAttribute('data-noite', 'sim');
    expect(window.location.search).toContain('vista=dentro');
    expect(window.location.search).toContain('luz=ambar');
    expect(window.location.search).toContain('ambiente=noite');
    // Abrir um ponto acende o holofote; um toque fora dele fecha.
    fireEvent.click(screen.getByRole('button', { name: /^Painel digital:/, hidden: true }));
    expect(screen.getByRole('button', { name: /^Painel digital:/, hidden: true })).toHaveAttribute('aria-expanded', 'true');
    // Os pontos com foto de perto: multimídia, teto e câmbio (este, só por dentro).
    const cambio = screen.getByRole('button', { name: 'Câmbio: Automático, híbrido dedicado (1DHT).', hidden: true });
    fireEvent.click(cambio);
    expect(cambio.parentElement!.querySelector('img')).toHaveAttribute('src', '/produtos/carrelio/detalhes/cambio.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar: Câmbio' }));
    expect(cambio).toHaveAttribute('aria-expanded', 'false');
    // Voltar para fora esconde a foto e deixa o resto como estava.
    fireEvent.click(within(barra()).getByRole('button', { name: 'Por fora' }));
    expect(interior).toHaveAttribute('data-ativo', 'nao');
    expect(window.location.search).not.toContain('luz=');
  });

  it('abre direto por dentro pelo link e pelo atalho da página', async () => {
    window.history.replaceState(null, '', '/produtos/carrelio?luz=roxo&ambiente=noite');
    montar();
    expect(await screen.findByRole('img', { name: /O interior do Jaecoo 5/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Roxo' })).toBeChecked();
    // A barra aparece por dentro mesmo sem o 3D aberto.
    expect(within(barra()).getByRole('button', { name: 'Por fora' })).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new CustomEvent(EVENTO_DE_COMANDO, { detail: { vista: 'fora', ambiente: 'noite', farois: true } }));
    });
    expect(await screen.findByRole('button', { name: /Entrar no carro/ })).toBeInTheDocument();
    expect(within(barra()).getByRole('button', { name: 'Faróis' })).toHaveAttribute('aria-pressed', 'true');
  });
});
