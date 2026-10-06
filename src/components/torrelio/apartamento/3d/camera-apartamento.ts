import * as T from 'three';
import { PLANTA } from '@/lib/torrelio/planta';
import type { EstadoDoApartamento } from './contrato';
import { paraMundo } from './geometria-apartamento';

/**
 * A câmera da maquete: órbita esférica (azimute, ângulo a partir da vertical, raio) em volta de um
 * alvo, com encaixe pela abertura da lente, para casar com o pôster em qualquer proporção.
 * Na planta, olha de cima e gira em passos de 90°; na maquete, a órbita é limitada.
 */

const LENTE = 30;
/** Na maquete, a câmera fica a sudoeste do giro escolhido, a 40° da vertical: vê dentro dos cômodos e a varanda. */
const AZIMUTE_DA_MAQUETE = -0.6;
const POLAR_DA_MAQUETE = 0.7;
const POLAR_MINIMO = 0.35;
const POLAR_MAXIMO = 1.15;
const POLAR_DA_PLANTA = 0.012;
const POLAR_DO_COMODO = 0.46;

type Pose = { az: number; polar: number; raio: number; alvo: T.Vector3 };

const diferencaAngular = (de: number, para: number) => {
  let d = (para - de) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

export function criarCamera(inicial: EstadoDoApartamento) {
  const camera = new T.PerspectiveCamera(LENTE, 1, 0.5, 200);
  let aspecto = 1;
  let orbitaAz = 0;
  let orbitaPolar = 0;
  let zoom = 1;
  const atual: Pose = { az: 0, polar: POLAR_DA_PLANTA, raio: 40, alvo: new T.Vector3() };
  const alvo: Pose = { az: 0, polar: POLAR_DA_PLANTA, raio: 40, alvo: new T.Vector3() };
  let estado = inicial;

  const meiaLente = () => {
    const v = ((LENTE / 2) * Math.PI) / 180;
    return { v, h: Math.atan(Math.tan(v) * aspecto) };
  };

  /** Distância para uma caixa vista de cima caber na tela (meia largura e meia altura em tela). */
  const encaixeDeCima = (meiaX: number, meiaY: number) => {
    const t = Math.tan(meiaLente().v);
    return Math.max(meiaY / t, meiaX / (t * aspecto)) * 1.04;
  };
  /**
   * Distância para uma caixa (meias medidas em x e z, altura y, em volta do alvo) caber na lente,
   * vista do azimute e do ângulo dados: projeta os oito cantos no sistema da câmera.
   */
  const encaixeDaCaixa = (meiaX: number, meiaZ: number, alturaY: number, alvoY: number, az: number, polar: number) => {
    const { v, h } = meiaLente();
    const w = new T.Vector3(Math.sin(polar) * Math.sin(az), Math.cos(polar), Math.sin(polar) * Math.cos(az));
    const direita = new T.Vector3(0, 1, 0).cross(w).normalize();
    const cima = w.clone().cross(direita);
    let distancia = 0;
    for (const x of [-meiaX, meiaX]) {
      for (const z of [-meiaZ, meiaZ]) {
        for (const y of [0, alturaY]) {
          const p = new T.Vector3(x, y - alvoY, z);
          const profundidade = p.dot(w);
          distancia = Math.max(distancia, profundidade + Math.abs(p.dot(direita)) / Math.tan(h), profundidade + Math.abs(p.dot(cima)) / Math.tan(v));
        }
      }
    }
    return distancia * 1.06;
  };

  function calcular(e: EstadoDoApartamento) {
    const espelho = e.espelhada ? -1 : 1;
    const giro = (e.giro * Math.PI) / 180;
    if (e.modo === 'planta') {
      // A caixa da planta com as cotas: [−2,85; 9,65] × [−2,85; 7,10] no desenho.
      const [x, z] = paraMundo(3.4, 2.125);
      alvo.alvo.set(x * espelho, 0, z);
      const deitado = e.giro % 180 !== 0;
      alvo.raio = encaixeDeCima(deitado ? 4.98 : 6.25, deitado ? 6.25 : 4.98);
      alvo.az = giro;
      alvo.polar = POLAR_DA_PLANTA;
      return;
    }
    alvo.az = giro + AZIMUTE_DA_MAQUETE * espelho + orbitaAz;
    alvo.polar = Math.min(POLAR_MAXIMO, Math.max(POLAR_MINIMO, POLAR_DA_MAQUETE + orbitaPolar));
    const comodo = PLANTA.comodos.find((c) => c.id === e.selecionado);
    if (comodo) {
      // Mais de cima, para o piso do cômodo aparecer por cima das paredes de 2,20 m.
      alvo.polar = Math.min(alvo.polar, POLAR_DO_COMODO);
      // O cômodo escolhido, com folga de 1,6 m em volta: dá para ver por onde se chega a ele.
      const xs = comodo.poligono.map((p) => p[0]);
      const ys = comodo.poligono.map((p) => p[1]);
      const [x, z] = paraMundo((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2);
      alvo.alvo.set(x * espelho, 0.6, z);
      const meiaX = (Math.max(...xs) - Math.min(...xs)) / 2 + 1.6;
      const meiaZ = (Math.max(...ys) - Math.min(...ys)) / 2 + 1.6;
      alvo.raio = encaixeDaCaixa(meiaX, meiaZ, 2.2, 0.6, alvo.az, alvo.polar) * zoom;
    } else {
      // O apartamento inteiro, com a varanda: 10,20 × 7,70 m em volta do meio.
      alvo.alvo.set(0, 0.6, 0);
      alvo.raio = encaixeDaCaixa(5.1, 3.85, 2.2, 0.6, alvo.az, alvo.polar) * zoom;
    }
  }

  function posicionar() {
    const seno = Math.sin(atual.polar);
    camera.position.set(
      atual.alvo.x + atual.raio * seno * Math.sin(atual.az),
      atual.alvo.y + atual.raio * Math.cos(atual.polar),
      atual.alvo.z + atual.raio * seno * Math.cos(atual.az),
    );
    camera.near = Math.max(0.3, atual.raio * 0.2);
    camera.far = atual.raio * 3 + 20;
    camera.updateProjectionMatrix();
    camera.lookAt(atual.alvo);
    camera.updateMatrixWorld();
  }

  return {
    camera,
    redimensionar(proporcao: number) {
      aspecto = proporcao;
      camera.aspect = proporcao;
      camera.updateProjectionMatrix();
    },
    /** Recalcula a pose desejada; `reiniciar` esquece a órbita e o zoom de quem arrastou. */
    pousar(e: EstadoDoApartamento, reiniciar: boolean) {
      if (reiniciar) {
        orbitaAz = 0;
        orbitaPolar = 0;
        zoom = 1;
      }
      estado = e;
      calcular(e);
    },
    /** Aproxima a pose atual da desejada; `k` = 1 salta. Devolve se ainda falta caminho. */
    passo(k: number): boolean {
      const dAz = diferencaAngular(atual.az, alvo.az);
      atual.az += dAz * k;
      atual.polar += (alvo.polar - atual.polar) * k;
      atual.raio += (alvo.raio - atual.raio) * k;
      atual.alvo.lerp(alvo.alvo, k);
      const falta =
        Math.abs(diferencaAngular(atual.az, alvo.az)) > 0.0008 ||
        Math.abs(alvo.polar - atual.polar) > 0.0008 ||
        Math.abs(alvo.raio - atual.raio) > 0.005 ||
        atual.alvo.distanceTo(alvo.alvo) > 0.002;
      if (!falta) {
        atual.az = alvo.az;
        atual.polar = alvo.polar;
        atual.raio = alvo.raio;
        atual.alvo.copy(alvo.alvo);
      }
      posicionar();
      return falta;
    },
    /** Arrasto na maquete: segue o ponteiro, sem inércia. */
    orbitar(dx: number, dy: number) {
      orbitaAz -= dx * 0.008;
      orbitaPolar = Math.min(POLAR_MAXIMO - POLAR_DA_MAQUETE, Math.max(POLAR_MINIMO - POLAR_DA_MAQUETE, orbitaPolar - dy * 0.005));
      calcular(estado);
      atual.az = alvo.az;
      atual.polar = alvo.polar;
    },
    zoom(fator: number) {
      zoom = Math.min(1.35, Math.max(0.55, zoom * fator));
      calcular(estado);
    },
    azimuteEmGraus: () => (atual.az * 180) / Math.PI,
  };
}
