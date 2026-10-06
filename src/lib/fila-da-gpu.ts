/**
 * Fila da GPU.
 *
 * Compilar shader pode levar centenas de milissegundos no processo da GPU. Esse processo atende uma
 * coisa de cada vez: quem espera a compilação de forma síncrona, como a cena 3D do hero em three.js
 * ou a torre do Torrelio, fica parado na thread principal atrás de quem compilou antes. Numa página
 * que carrega duas cenas, isso vira tarefa longa e piora o tempo de bloqueio.
 *
 * Quem compila pesado e não pode esperar reserva a fila; quem pode esperar usa `quandoGpuLivre` e só
 * começa quando ninguém mais está reservando. Não há espera infinita: quem espera leva um teto.
 */

let reservas = 0;
const esperando = new Set<() => void>();

/** Reserva a fila. Devolve a função que libera; chamar mais de uma vez não faz mal. */
export function reservarGpu(): () => void {
  reservas += 1;
  let liberada = false;
  return () => {
    if (liberada) return;
    liberada = true;
    reservas -= 1;
    if (reservas > 0) return;
    const fila = [...esperando];
    esperando.clear();
    fila.forEach((seguir) => seguir());
  };
}

/**
 * Chama `seguir` quando a fila estiver livre, ou depois de `tetoMs`, o que vier primeiro, e só uma
 * vez. Devolve a função que cancela a espera.
 */
export function quandoGpuLivre(seguir: () => void, tetoMs: number): () => void {
  let feito = false;
  const uma = () => {
    if (feito) return;
    feito = true;
    window.clearTimeout(teto);
    esperando.delete(uma);
    seguir();
  };
  const teto = window.setTimeout(uma, tetoMs);
  if (reservas === 0) queueMicrotask(uma);
  else esperando.add(uma);
  return () => {
    feito = true;
    window.clearTimeout(teto);
    esperando.delete(uma);
  };
}
