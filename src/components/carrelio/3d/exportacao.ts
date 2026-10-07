import {
  CanvasTexture, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, OrthographicCamera, Scene, ShaderMaterial, SRGBColorSpace, UnsignedByteType,
  WebGLRenderTarget, type Material, type Texture, type WebGLRenderer,
} from 'three';
import type { ManifestoDoModelo } from './contrato';
import type { DadosDaMascara } from './materiais';
import type { CarroMontado } from './montagem';

/**
 * "Ver na sua garagem" (Quick Look, no iPhone): o carro na cor atual, em USDZ. As portas saem
 * fechadas (a geometria de repouso) e só o carro vai, sem chão nem estúdio.
 *
 * A pintura por máscara mora no shader, e o USDZ só leva texturas: a cor tingida é assada numa
 * textura nova, desenhando a malha no espaço da textura (UV) com a mesma conta da máscara; as
 * bordas das ilhas do atlas são esticadas uns pixels, para o filtro não puxar o fundo.
 */

const LADO_DA_TEXTURA = 2048;

/** Assa a cor tingida da textura de um material pintado por máscara. */
function assarCor(renderer: WebGLRenderer, malha: Mesh, mapa: Texture, dados: DadosDaMascara, fator: MeshStandardMaterial['color']): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const material = new ShaderMaterial({
    uniforms: { ...dados.uniformes, ...dados.locais, uMapa: { value: mapa }, uFator: { value: fator } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vPosCarro;
      void main() {
        vUv = uv;
        vPosCarro = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
        // O glTF guarda a textura com a primeira linha em v = 0 (flipY falso).
        gl_Position = vec4( uv.x * 2.0 - 1.0, uv.y * 2.0 - 1.0, 0.0, 1.0 );
      }`,
    fragmentShader: /* glsl */ `uniform sampler2D uMapa; uniform vec3 uFator; varying vec2 vUv;
      ${dados.declaracoes}
      void main() {
        vec3 carTexel = texture2D( uMapa, vUv ).rgb;
        CarMascara carM = carMascara( carTexel, 0.0, vPosCarro );
        vec3 cor = mix( carTexel * uFator, carM.tingido, carM.pintura );
        cor *= mix( 1.0, 0.2, carM.vidro );
        vec3 srgb = mix( cor * 12.92, 1.055 * pow( max( cor, vec3( 0.0 ) ), vec3( 1.0 / 2.4 ) ) - 0.055, step( 0.0031308, cor ) );
        gl_FragColor = vec4( clamp( srgb, 0.0, 1.0 ), 1.0 );
      }`,
    depthTest: false,
    depthWrite: false,
    side: 2,
  });
  const alvo = new WebGLRenderTarget(LADO_DA_TEXTURA, LADO_DA_TEXTURA, { type: UnsignedByteType, depthBuffer: false });
  const cena = new Scene();
  const copia = new Mesh(malha.geometry, material);
  copia.matrixAutoUpdate = false;
  copia.matrix.copy(malha.matrixWorld);
  copia.matrixWorld.copy(malha.matrixWorld);
  copia.frustumCulled = false;
  cena.add(copia);
  const anterior = renderer.getRenderTarget();
  renderer.setRenderTarget(alvo);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(cena, new OrthographicCamera());
  const pixels = new Uint8Array(LADO_DA_TEXTURA * LADO_DA_TEXTURA * 4);
  renderer.readRenderTargetPixels(alvo, 0, 0, LADO_DA_TEXTURA, LADO_DA_TEXTURA, pixels);
  renderer.setRenderTarget(anterior);
  alvo.dispose();
  material.dispose();
  dilatar(pixels, LADO_DA_TEXTURA, 4);
  const canvas = document.createElement('canvas');
  canvas.width = LADO_DA_TEXTURA;
  canvas.height = LADO_DA_TEXTURA;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // A linha 0 da leitura é v = 0, que é a primeira linha da imagem no glTF: copia na mesma ordem.
  ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer), LADO_DA_TEXTURA, LADO_DA_TEXTURA), 0, 0);
  const textura = new CanvasTexture(canvas);
  textura.flipY = false;
  textura.colorSpace = SRGBColorSpace;
  // O exportador grava PNG por padrão: em JPEG, o arquivo do Quick Look cai de ~9 MB para ~1 MB.
  textura.userData['mimeType'] = 'image/jpeg';
  return textura;
}

/** Estica a cor das ilhas para os pixels vazios em volta (alfa 0), `vezes` pixels. */
export function dilatar(pixels: Uint8Array, lado: number, vezes: number): void {
  for (let passada = 0; passada < vezes; passada += 1) {
    const copia = pixels.slice();
    for (let y = 0; y < lado; y += 1) {
      for (let x = 0; x < lado; x += 1) {
        const i = (y * lado + x) * 4;
        if (copia[i + 3] !== 0) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= lado || ny >= lado) continue;
          const j = (ny * lado + nx) * 4;
          if (copia[j + 3] === 0) continue;
          pixels[i] = copia[j]!;
          pixels[i + 1] = copia[j + 1]!;
          pixels[i + 2] = copia[j + 2]!;
          pixels[i + 3] = 255;
          break;
        }
      }
    }
  }
}

export async function exportarCarroEmUsdz(renderer: WebGLRenderer, carro: CarroMontado, manifesto: ManifestoDoModelo): Promise<Blob | null> {
  const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');
  const raiz = new Group();
  raiz.name = manifesto.id;
  raiz.position.copy(carro.grupo.position);
  raiz.quaternion.copy(carro.grupo.quaternion);
  raiz.scale.copy(carro.grupo.scale);
  const temporarios: (Material | Texture)[] = [];
  const trocados = new Map<Material, Material>();
  carro.grupo.updateMatrixWorld(true);

  const materialDeExportacao = (original: Material, malha: Mesh): Material => {
    const pronto = trocados.get(original);
    if (pronto) return pronto;
    let novo: Material = original;
    const padrao = original as MeshStandardMaterial;
    const dados = original.userData['mascara'] as DadosDaMascara | undefined;
    if (original === carro.materiais.vidro.material) {
      novo = new MeshStandardMaterial({ name: 'vidro', color: 0x101317, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.45 });
    } else if (original === carro.materiais.tinta || original === carro.materiais.tetoTinta) {
      const tinta = original as MeshPhysicalMaterial;
      novo = new MeshPhysicalMaterial({ name: 'pintura', color: tinta.color, metalness: tinta.metalness, roughness: tinta.roughness, clearcoat: 1, clearcoatRoughness: 0.05 });
    } else if (dados && padrao.map) {
      const assada = assarCor(renderer, malha, padrao.map, dados, padrao.color);
      if (assada) {
        temporarios.push(assada);
        novo = new MeshStandardMaterial({ name: 'carroceria', map: assada, roughness: 0.4, metalness: 0, normalMap: padrao.normalMap });
      }
    }
    if (novo !== original) temporarios.push(novo);
    trocados.set(original, novo);
    return novo;
  };

  carro.grupo.traverseVisible((o) => {
    const malha = o as Mesh;
    if (!malha.isMesh || Array.isArray(malha.material) || malha.material.visible === false) return;
    const copia = new Mesh(malha.geometry, materialDeExportacao(malha.material, malha));
    copia.name = malha.name.replace(/[^\w]/g, '_') || 'parte';
    raiz.add(copia);
  });
  try {
    const exportador = new USDZExporter();
    const dados = await exportador.parseAsync(raiz, { quickLookCompatible: true, maxTextureSize: LADO_DA_TEXTURA });
    return new Blob([dados], { type: 'model/vnd.usdz+zip' });
  } finally {
    for (const t of temporarios) t.dispose();
  }
}
