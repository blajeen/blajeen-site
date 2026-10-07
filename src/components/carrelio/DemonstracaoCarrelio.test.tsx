import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '@/components/motion/MotionProvider';
import type { PortaId } from '@/lib/carrelio/tipos';
import type { CenaCarro, EstadoVisualCarro, ManifestoDoModelo, Projecao } from './3d/contrato';
import { DemonstracaoCarrelio } from './DemonstracaoCarrelio';
import { obterLoja, reiniciarLoja } from './loja';
import { EVENTO_DE_COMANDO } from './VerNaDemonstracao';

const { carregar } = vi.hoisted(() => ({ carregar: vi.fn() }));
vi.mock('./3d/carregar', () => ({ carregarCarro: carregar }));

/** Um manifesto de teste: duas portas, porta-malas, pontos de fora e de dentro, e o motorista. */
vi.mock('./3d/modelos', () => {
  const modelo: ManifestoDoModelo = {
    id: 'teste',
    url: '/produtos/carrelio/modelos/teste.glb',
    credito: 'Carro de teste, CC BY 4.0.',
    provisorio: true,
    comprimentoM: 4.38,
    pintura: ['Paint'],
    teto: ['Roof'],
    rack: [],
    farois: ['Headlight'],
    lanternas: ['Taillight'],
    esconder: [],
    portas: { dianteiraEsquerda: { no: 'DoorL', eixo: 'y', graus: 60 }, portaMalas: { no: 'Hatch', eixo: 'x', graus: -70 } },
    pontos: { farois: [0.7, 0.7, 2], rodas: [0.9, 0.35, 1.3], teto: [0, 1.6, 0], multimidia: [0, 1.1, 0.6] },
    interior: { motorista: { olho: [0.35, 1.15, -0.1], alvo: [0.35, 1, 1] } },
  };
  return { MODELO_ATUAL: modelo };
});

/** Uma cena de mentira: guarda cada estado que a interface manda e deixa o teste disparar eventos. */
let cena: {
  estados: EstadoVisualCarro[];
  tocar?: (peca: PortaId) => void;
  arrastar?: () => void;
  projetar?: (pontos: readonly Projecao[]) => void;
  descartada: boolean;
};

function montar() {
  return render(
    <MotionProvider>
      <DemonstracaoCarrelio />
    </MotionProvider>,
  );
}

const ultimo = () => cena.estados.at(-1)!;

/** Abre o 3D e espera a interface assinar os eventos da cena (o palco já trocou o pôster pelo carro). */
async function abrir3d() {
  const botao = screen.queryByRole('button', { name: /Abrir o carro em 3D/ });
  if (botao) fireEvent.click(botao);
  await waitFor(() => expect(cena.arrastar).toBeDefined());
}

describe('a demonstração do Carrelio', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/produtos/carrelio');
    window.localStorage.clear();
    reiniciarLoja();
    cena = { estados: [], descartada: false };
    carregar.mockReset();
    carregar.mockImplementation(async (_host: HTMLElement, opcoes: { estado: EstadoVisualCarro }): Promise<CenaCarro> => {
      cena.estados.push(opcoes.estado);
      return {
        aplicar: (estado) => void cena.estados.push(estado),
        enquadrar: () => {},
        zoom: () => {},
        definirAreaLivre: () => {},
        aoProjetar: (f) => {
          cena.projetar = f;
          return () => {};
        },
        aoTocarPeca: (f) => {
          cena.tocar = f;
          return () => {};
        },
        aoArrastar: (f) => {
          cena.arrastar = f;
          return () => {};
        },
        aoMudarContexto: () => () => {},
        exportarUsdz: async () => null,
        diagnostico: { quadros: 0, chamadas: 0, triangulos: 0 },
        descartar: () => {
          cena.descartada = true;
        },
      };
    });
  });
  afterEach(() => reiniciarLoja());

  it('abre no Prestige Azul Gaia, com preço, situação no estoque e a loja, sem carregar o 3D', () => {
    montar();
    expect(screen.getByRole('heading', { name: 'Jaecoo 5' })).toBeInTheDocument();
    expect(screen.getByText('COMERI OMODA · DEMONSTRAÇÃO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prestige' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('radio', { name: /Azul Gaia/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/^R\$\s179\.990$/)).toBeInTheDocument();
    expect(screen.getByText('Chega em cerca de 20 dias')).toBeInTheDocument();
    expect(carregar).not.toHaveBeenCalled();
  });

  it('manda a cor, o teto preto e os itens da versão para a cena', async () => {
    montar();
    await abrir3d();
    expect(ultimo()).toMatchObject({ pintura: '#4f6377', tetoPreto: false, tetoPanoramico: true, vista: 'fora' });
    fireEvent.click(screen.getByRole('radio', { name: /Branco Arctic/ }));
    await waitFor(() => expect(ultimo()).toMatchObject({ pintura: '#e6e8e6', tetoPreto: true }));
    expect(screen.getByText(/Branco Arctic, teto preto/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Comfort' }));
    await waitFor(() => expect(ultimo()).toMatchObject({ tetoPreto: false, tetoPanoramico: false }));
    expect(screen.getByText(/^R\$\s154\.990$/)).toBeInTheDocument();
  });

  it('abre as portas, acende os faróis à noite, entra no carro e o toque numa porta a abre', async () => {
    montar();
    await abrir3d();
    const barra = screen.getByRole('group', { name: 'Controles do carro' });
    fireEvent.click(within(barra).getByRole('button', { name: 'Portas' }));
    await waitFor(() => expect(ultimo().portas.dianteiraEsquerda).toBe(true));
    fireEvent.click(within(barra).getByRole('button', { name: 'Noite' }));
    await waitFor(() => expect(ultimo()).toMatchObject({ ambiente: 'noite', farois: true }));
    fireEvent.click(within(barra).getByRole('button', { name: 'Portas' }));
    await waitFor(() => expect(ultimo().portas.dianteiraEsquerda).toBe(false));
    act(() => cena.tocar!('portaMalas'));
    await waitFor(() => expect(ultimo().portas.portaMalas).toBe(true));
    fireEvent.click(screen.getByRole('button', { name: /Entrar no carro/ }));
    await waitFor(() => expect(ultimo()).toMatchObject({ vista: 'dentro', ponto: 'motorista', girando: false }));
    expect(within(barra).getByRole('button', { name: 'Por fora' })).toBeInTheDocument();
    // O modelo de teste só tem o motorista por dentro: nada de escolher o banco de trás.
    expect(within(barra).queryByRole('button', { name: 'Banco de trás' })).toBeNull();
  });

  it('mostra os pontos de toque da vista, com o texto da versão, onde a cena projeta', async () => {
    montar();
    await abrir3d();
    // A primeira projeção chega com o carro: os pontos já estão montados para recebê-la (com a câmera
    // parada, como no movimento reduzido, não vem outra), e aparecem depois que o pôster se dissolve.
    act(() => cena.projetar!([{ id: 'teto', x: 120, y: 80, visivel: true }, { id: 'farois', x: 10, y: 10, visivel: false }]));
    const grupo = screen.getByRole('group', { name: 'Destaques por fora' });
    expect(grupo).toHaveAttribute('data-revelado', 'nao');
    await waitFor(() => expect(grupo).toHaveAttribute('data-revelado', 'sim'));
    const teto = screen.getByRole('button', { name: 'Teto panorâmico: Fixo, de 1,45 m².' });
    expect(teto.parentElement).not.toHaveAttribute('hidden');
    expect(teto.parentElement!.style.transform).toBe('translate3d(120.0px, 80.0px, 0)');
    // Perto do alto do palco, o balão abre para baixo.
    expect(teto.parentElement).toHaveAttribute('data-vertical', 'abaixo');
    expect(screen.getByRole('button', { name: 'Faróis: Full LED.', hidden: true }).parentElement).toHaveAttribute('hidden');
    fireEvent.click(teto);
    expect(teto).toHaveAttribute('aria-expanded', 'true');
    // O ponto do teto tem foto de detalhe: no balão (computador) e no cartão com "fechar" (celular).
    const balao = teto.parentElement!.querySelector('p')!;
    expect(balao.querySelector('img')).toHaveAttribute('src', '/produtos/carrelio/detalhes/teto.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar: Teto panorâmico' }));
    expect(teto).toHaveAttribute('aria-expanded', 'false');
  });

  it('com movimento, a mesa fica parada no primeiro quadro (o do pôster) e gira depois; arrastar para, e o botão volta a girar', async () => {
    montar();
    await abrir3d();
    // A cena nasce parada, acima da barra do pé, igual ao pôster que ela substitui.
    expect(carregar.mock.calls[0]![1]).toMatchObject({ estado: { girando: false }, areaLivre: { base: 64 } });
    await waitFor(() => expect(ultimo().girando).toBe(true));
    act(() => cena.arrastar!());
    await waitFor(() => expect(ultimo().girando).toBe(false));
    const girar = within(screen.getByRole('group', { name: 'Controles do carro' })).getByRole('button', { name: 'Girar' });
    expect(girar).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(girar);
    await waitFor(() => expect(ultimo().girando).toBe(true));
  });

  it('o painel muda o estoque e o cliente vê na hora; o pedido de test drive aparece no painel', async () => {
    montar();
    fireEvent.click(screen.getByRole('tab', { name: 'Painel da loja' }));
    const linha = screen.getByRole('group', { name: 'Prestige Azul Gaia: carros na loja' });
    fireEvent.click(within(linha).getByRole('button', { name: 'Pôr mais um' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Visão do cliente' }));
    expect(within(screen.getByRole('tabpanel', { name: 'Visão do cliente' })).getByText('Pronta entrega · 1 na loja')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Agendar test drive' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tarde' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pedir test drive' }));
    const confirmacao = (await screen.findByText(/Pedido de demonstração feito/)).closest('div')!;
    // O formulário some com o botão que tinha o foco: a confirmação recebe o foco e diz o carro.
    expect(confirmacao).toHaveFocus();
    expect(confirmacao).toHaveTextContent('Prestige Azul Gaia');
    expect(obterLoja().obter().estado.testDrives[0]).toMatchObject({ versao: 'prestige', cor: 'azul-gaia', periodo: 'tarde' });
    // A aba do painel conta o pedido que a loja ainda não confirmou.
    expect(screen.getByRole('tab', { name: 'Painel da loja, 1 pedido de test drive novo' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ver no painel da loja/ }));
    expect(screen.getByRole('tab', { name: /^Painel da loja/ })).toHaveAttribute('aria-selected', 'true');
    // A página vai até os pedidos, o primeiro bloco do painel, com o novo marcado.
    const pedidos = screen.getByRole('heading', { name: /Pedidos de test drive/ });
    expect(pedidos).toHaveFocus();
    expect(pedidos).toHaveTextContent('1 novo');
    expect(screen.getByText('NOVO')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(screen.getByText('CONFIRMADO')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Painel da loja' })).toBeInTheDocument();
  });

  it('põe a campanha junto do preço e resume os itens da versão, com o resto num toque', () => {
    montar();
    const cartao = within(screen.getByRole('tabpanel', { name: 'Visão do cliente' }));
    expect(cartao.getByText('CAMPANHA')).toBeInTheDocument();
    expect(cartao.getByText(/Preço de lançamento nas primeiras 3\.600 unidades/)).toBeInTheDocument();
    expect(cartao.queryByText('Câmeras 360°')).toBeNull();
    const mais = cartao.getByRole('button', { name: 'Mais 9 itens' });
    expect(mais).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(mais);
    expect(cartao.getByText('Câmeras 360°')).toBeInTheDocument();
    expect(cartao.getByRole('button', { name: 'Mostrar menos' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('abre o "na sua garagem" e fecha com Esc, devolvendo o foco a quem abriu', async () => {
    montar();
    const botao = within(screen.getByRole('group', { name: 'Controles do carro' })).getByRole('button', { name: 'Na sua garagem' });
    botao.focus();
    fireEvent.click(botao);
    const titulo = await screen.findByRole('heading', { name: 'Na sua garagem' });
    expect(titulo).toHaveFocus();
    fireEvent.keyDown(titulo, { key: 'Escape' });
    expect(screen.queryByRole('heading', { name: 'Na sua garagem' })).toBeNull();
    expect(botao).toHaveFocus();
  });

  it('só mostra a tela cheia onde o navegador deixa (no iPhone, não)', () => {
    const { unmount } = montar();
    expect(screen.queryByRole('button', { name: 'Tela cheia' })).toBeNull();
    unmount();
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: true });
    try {
      montar();
      expect(screen.getByRole('button', { name: 'Tela cheia' })).toBeInTheDocument();
    } finally {
      delete (document as { fullscreenEnabled?: boolean }).fullscreenEnabled;
    }
  });

  it('abre pelo link e pelos atalhos da página', async () => {
    window.history.replaceState(null, '', '/produtos/carrelio?versao=comfort&cor=preto-andromeda&vista=dentro');
    montar();
    await waitFor(() => expect(screen.getByRole('radio', { name: /Preto Andromeda/ })).toHaveAttribute('aria-checked', 'true'));
    expect(screen.getByRole('button', { name: 'Comfort' })).toHaveAttribute('aria-pressed', 'true');
    act(() => {
      window.dispatchEvent(new CustomEvent(EVENTO_DE_COMANDO, { detail: { ambiente: 'noite', farois: true } }));
    });
    await waitFor(() => expect(carregar).toHaveBeenCalled());
    await waitFor(() => expect(ultimo()).toMatchObject({ ambiente: 'noite', farois: true, vista: 'dentro' }));
    // O endereço acompanha a configuração.
    expect(window.location.search).toContain('versao=comfort');
    expect(window.location.search).toContain('ambiente=noite');
  });

  it('com movimento reduzido, a mesa não gira sozinha, mas gira pelo botão', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((consulta: string) => ({ ...original(consulta), matches: consulta.includes('reduce') })) as typeof window.matchMedia;
    try {
      montar();
      await abrir3d();
      expect(ultimo()).toMatchObject({ movimento: false, girando: false });
      fireEvent.click(within(screen.getByRole('group', { name: 'Controles do carro' })).getByRole('button', { name: 'Girar' }));
      await waitFor(() => expect(ultimo().girando).toBe(true));
    } finally {
      window.matchMedia = original;
    }
  });

  it('se o 3D falhar, avisa, e o cartão continua funcionando', async () => {
    carregar.mockRejectedValueOnce(new Error('sem WebGL'));
    montar();
    fireEvent.click(screen.getByRole('button', { name: /Abrir o carro em 3D/ }));
    expect(await screen.findByText(/Seu navegador não abriu o 3D/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Cinza Centaurus/ }));
    expect(screen.getByRole('radio', { name: /Cinza Centaurus/ })).toHaveAttribute('aria-checked', 'true');
  });
});
