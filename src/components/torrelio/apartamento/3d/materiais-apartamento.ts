import * as T from 'three';

/**
 * Os materiais da maquete. Dois remendos de shader, pequenos:
 * - paredes e vidros baixam juntos até a altura `uAltura` (2,20 m na maquete, 0,12 m na planta);
 *   vergas acima dela somem, em vez de virarem uma tampa sobre a porta;
 * - o piso tinge de sinal (12%) o cômodo em foco, por índice, sem refazer geometria.
 */

const linear = (hex: number) => new T.Color().setHex(hex, T.SRGBColorSpace);
export const SINAL = linear(0xc9ff3d);

export type UniformesDaMaquete = {
  uAltura: { value: number };
  uSelecionado: { value: number };
  uDestaque: { value: number };
  uForcaSelecionado: { value: number };
  uForcaDestaque: { value: number };
  uSinal: { value: T.Color };
};

export function criarUniformes(): UniformesDaMaquete {
  return {
    uAltura: { value: 2.2 },
    uSelecionado: { value: -1 },
    uDestaque: { value: -1 },
    uForcaSelecionado: { value: 0 },
    uForcaDestaque: { value: 0 },
    uSinal: { value: SINAL.clone() },
  };
}

function baixar(material: T.Material, u: UniformesDaMaquete, chave: string) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms['uAltura'] = u.uAltura;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aBase;\nuniform float uAltura;')
      .replace(
        '#include <begin_vertex>',
        // Acima da altura, tudo comprime para 2% (a ordem das faces se mantém, sem brigar no z).
        '#include <begin_vertex>\ntransformed.y = aBase > uAltura - 0.001 ? -0.4 : (transformed.y <= uAltura ? transformed.y : uAltura + (transformed.y - uAltura) * 0.02);',
      );
  };
  material.customProgramCacheKey = () => chave;
}

const FOCO_GLSL = `
float focoSel = (1.0 - step(0.5, abs(vComodo - uSelecionado))) * uForcaSelecionado;
float focoDes = (1.0 - step(0.5, abs(vComodo - uDestaque))) * uForcaDestaque;
float foco = max(focoSel, focoDes);`;

export function criarMateriais(u: UniformesDaMaquete) {
  const paredes = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0 });
  baixar(paredes, u, 'torrelio-paredes');

  const vidros = new T.MeshStandardMaterial({
    color: linear(0xd6e6e4),
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  });
  baixar(vidros, u, 'torrelio-vidros');

  const pisos = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });
  pisos.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uSelecionado: u.uSelecionado,
      uDestaque: u.uDestaque,
      uForcaSelecionado: u.uForcaSelecionado,
      uForcaDestaque: u.uForcaDestaque,
      uSinal: u.uSinal,
    });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aComodo;\nvarying float vComodo;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvComodo = aComodo;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vComodo;\nuniform float uSelecionado;\nuniform float uDestaque;\nuniform float uForcaSelecionado;\nuniform float uForcaDestaque;\nuniform vec3 uSinal;',
      )
      .replace('#include <color_fragment>', `#include <color_fragment>\n${FOCO_GLSL}\ndiffuseColor.rgb = mix(diffuseColor.rgb, uSinal, 0.12 * foco);`);
  };
  pisos.customProgramCacheKey = () => 'torrelio-pisos';

  const contornos = new T.LineBasicMaterial({ color: SINAL, transparent: true, depthWrite: false });
  contornos.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uSelecionado: u.uSelecionado,
      uDestaque: u.uDestaque,
      uForcaSelecionado: u.uForcaSelecionado,
      uForcaDestaque: u.uForcaDestaque,
    });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aComodo;\nvarying float vComodo;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvComodo = aComodo;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vComodo;\nuniform float uSelecionado;\nuniform float uDestaque;\nuniform float uForcaSelecionado;\nuniform float uForcaDestaque;',
      )
      .replace('#include <color_fragment>', `#include <color_fragment>\n${FOCO_GLSL}\nif (foco < 0.01) discard;\ndiffuseColor.a *= foco;`);
  };
  contornos.customProgramCacheKey = () => 'torrelio-contornos';

  return {
    paredes,
    vidros,
    pisos,
    contornos,
    moveis: (() => {
      const material = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0 });
      baixar(material, u, 'torrelio-moveis');
      return material;
    })(),
    laje: new T.MeshStandardMaterial({ color: linear(0x8d9088), roughness: 0.95, metalness: 0 }),
    sombraSo: new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
    chao: new T.ShadowMaterial({ color: 0x000000, opacity: 0.32 }),
    linhas: new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false }),
  };
}

export type MateriaisDaMaquete = ReturnType<typeof criarMateriais>;
