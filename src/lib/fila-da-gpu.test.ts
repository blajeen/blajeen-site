import { quandoGpuLivre, reservarGpu } from './fila-da-gpu';

describe('fila da GPU', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('com a fila livre, segue logo, uma vez só', async () => {
    const seguir = vi.fn();
    quandoGpuLivre(seguir, 8000);
    await Promise.resolve();
    expect(seguir).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(9000);
    expect(seguir).toHaveBeenCalledTimes(1);
  });

  it('com a fila reservada, espera a liberação', async () => {
    const liberar = reservarGpu();
    const seguir = vi.fn();
    quandoGpuLivre(seguir, 8000);
    await Promise.resolve();
    vi.advanceTimersByTime(3000);
    expect(seguir).not.toHaveBeenCalled();
    liberar();
    expect(seguir).toHaveBeenCalledTimes(1);
  });

  it('só segue quando a última reserva sai', () => {
    const primeira = reservarGpu();
    const segunda = reservarGpu();
    const seguir = vi.fn();
    quandoGpuLivre(seguir, 8000);
    primeira();
    expect(seguir).not.toHaveBeenCalled();
    segunda();
    expect(seguir).toHaveBeenCalledTimes(1);
  });

  it('liberar duas vezes não desconta outra reserva', () => {
    const primeira = reservarGpu();
    const segunda = reservarGpu();
    const seguir = vi.fn();
    quandoGpuLivre(seguir, 8000);
    primeira();
    primeira();
    expect(seguir).not.toHaveBeenCalled();
    segunda();
    expect(seguir).toHaveBeenCalledTimes(1);
  });

  it('não espera para sempre: segue no teto se a reserva nunca sair', () => {
    const liberar = reservarGpu();
    const seguir = vi.fn();
    quandoGpuLivre(seguir, 8000);
    vi.advanceTimersByTime(7999);
    expect(seguir).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(seguir).toHaveBeenCalledTimes(1);
    liberar();
    expect(seguir).toHaveBeenCalledTimes(1);
  });

  it('cancelada, não segue', async () => {
    const liberar = reservarGpu();
    const seguir = vi.fn();
    const cancelar = quandoGpuLivre(seguir, 8000);
    cancelar();
    liberar();
    vi.advanceTimersByTime(9000);
    await Promise.resolve();
    expect(seguir).not.toHaveBeenCalled();
  });
});
