import {
  AdditiveBlending, CanvasTexture, Color, CustomBlending, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, OneFactor, OneMinusSrcAlphaFactor,
  SpriteMaterial, SRGBColorSpace, Vector3, type Texture, type Vector2,
} from 'three';
import type { RegiaoDoCarro } from './contrato';
import { linearParaOklab, luminancia, type Rgb } from './cores';
import { BORDA_DA_REGIAO, empacotarRegioes } from './regioes';

/**
 * Os materiais da cena do carro: a pintura (com verniz e flocos), o vidro (mistura com reflexo
 * cheio), as luzes, os halos e a pintura por máscara (para o modelo de malha única gerado por IA,
 * em que lataria, vidro e faróis são uma textura só).
 *
 * A pintura por máscara é injetada no shader físico do three.js (`onBeforeCompile`): depois de ler a
 * textura, o shader mede o texel no OKLab (a mesma conta de `cores.ts`) e, onde ele tem a cor da
 * lataria, troca o difuso pela cor da pintura (com o sombreado assado), o metal e a rugosidade pelos
 * da pintura e acende o verniz. Regiões (caixas e cilindros no espaço do carro) tiram as rodas e o
 * interior da máscara, transformam o vidro assado em vidro escuro com reflexo e acendem os faróis.
 */

// ------------------------------------------------------------------------- pintura

export type Verniz = { intensidade: number; rugosidade: number };

/** O verniz de fábrica: cheio e quase espelhado. */
export const VERNIZ_DE_FABRICA: Verniz = { intensidade: 1, rugosidade: 0.03 };

/** A pintura de material próprio (modelo com materiais separados). */
export function criarTinta(flocos: { mapa: Texture; escala: Vector2 } | null, verniz: Verniz): MeshPhysicalMaterial {
  const m = new MeshPhysicalMaterial({
    name: 'carrelio:tinta',
    color: 0x435a8a,
    metalness: 0.6,
    roughness: 0.36,
    clearcoat: verniz.intensidade,
    clearcoatRoughness: verniz.rugosidade,
    side: DoubleSide,
  });
  if (flocos) {
    m.normalMap = flocos.mapa;
    m.normalScale = flocos.escala.clone();
    m.userData['escalaDosFlocos'] = flocos.escala.clone();
  }
  return m;
}

/** Aplica cor (linear), metal, rugosidade e força dos flocos a uma pintura de material próprio. */
export function pintar(m: MeshPhysicalMaterial, cor: Rgb, metalico: number, rugosidade: number, flocos: number): void {
  m.color.setRGB(cor[0], cor[1], cor[2]);
  m.metalness = metalico;
  m.roughness = rugosidade;
  const base = m.userData['escalaDosFlocos'] as Vector2 | undefined;
  if (base) m.normalScale.set(base.x * flocos, base.y * flocos);
}

// --------------------------------------------------------------------------- vidro

/**
 * O vidro: escuro, liso e com o reflexo inteiro. Na mistura comum, o reflexo também é multiplicado
 * pela opacidade, e o vidro de carro (quase transparente de frente) perdia os reflexos que fazem ele
 * parecer vidro. Aqui a saída é pré-multiplicada: o difuso pesa a opacidade, o reflexo entra cheio,
 * e de lado (Fresnel) o vidro fica mais opaco, como o de verdade.
 */
export function criarVidro(): { material: MeshPhysicalMaterial; opacidade: { value: number } } {
  const opacidade = { value: 0.5 };
  const material = new MeshPhysicalMaterial({
    name: 'carrelio:vidro',
    color: 0x0b0e11,
    metalness: 0,
    roughness: 0.04,
    ior: 1.5,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: CustomBlending,
    blendSrc: OneFactor,
    blendDst: OneMinusSrcAlphaFactor,
  });
  // Uma passada só (o three desenharia o verso e a frente separados): metade das chamadas.
  material.forceSinglePass = true;
  material.onBeforeCompile = (shader) => {
    shader.uniforms['uOpacidadeDoVidro'] = opacidade;
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform float uOpacidadeDoVidro;\nvoid main() {')
      .replace(
        '#include <opaque_fragment>',
        `float carFresnel = pow( 1.0 - saturate( dot( geometryNormal, geometryViewDir ) ), 5.0 );
float carAlfa = mix( uOpacidadeDoVidro, 1.0, carFresnel * 0.65 );
gl_FragColor = vec4( totalDiffuse * carAlfa + totalSpecular + totalEmissiveRadiance, carAlfa );`,
      );
  };
  material.customProgramCacheKey = () => 'carrelio:vidro';
  return { material, opacidade };
}

// --------------------------------------------------------------------------- luzes

/** Cor das luzes acesas (linear): LED branco frio na frente, vermelho atrás. */
export const COR_DO_FAROL = new Color().setRGB(0.92, 0.96, 1.0);
export const COR_DA_LANTERNA = new Color().setRGB(1.0, 0.06, 0.03);

/**
 * Uma luz de material próprio (farol, lanterna): apagada, a lente fica escura e lisa; acesa, o
 * emissivo vai da cor do arquivo até `intensidade` vezes.
 */
export function luzDeMaterial(original: MeshStandardMaterial, cor: Color, intensidade: number): { material: MeshStandardMaterial; acender(fator: number): void } {
  const material = original.clone();
  material.emissive.copy(cor);
  material.emissiveMap = null;
  material.emissiveIntensity = 0;
  material.roughness = Math.min(material.roughness, 0.2);
  return {
    material,
    acender(fator) {
      material.emissiveIntensity = intensidade * fator;
    },
  };
}

/** A textura dos halos: um brilho radial macio (sem anel), gerado uma vez. */
export function texturaDoHalo(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const lado = 64;
  const canvas = document.createElement('canvas');
  canvas.width = lado;
  canvas.height = lado;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const g = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.12, 'rgba(255,255,255,0.75)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.22)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.05)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, lado, lado);
  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace;
  return textura;
}

export function materialDoHalo(textura: Texture, cor: Color): SpriteMaterial {
  return new SpriteMaterial({ map: textura, color: cor, blending: AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
}

// ------------------------------------------------------------ pintura por máscara

/** Uniforms comuns a todos os materiais pintados por máscara: trocar a cor muda um lugar só. */
export type UniformesDaPintura = {
  uCorDaPintura: { value: Color };
  uMetalDaPintura: { value: number };
  uRugosidadeDaPintura: { value: number };
  /** Teto por região: 0 a 1 de preto (bicolor) e de vidro (teto panorâmico). */
  uCorDoTeto: { value: Color };
  uTetoPreto: { value: number };
  uTetoVidro: { value: number };
  uFarol: { value: number };
  uLanterna: { value: number };
  uCorDoFarol: { value: Color };
  uCorDaLanterna: { value: Color };
};

export function criarUniformesDaPintura(): UniformesDaPintura {
  return {
    uCorDaPintura: { value: new Color(0.5, 0.5, 0.5) },
    uMetalDaPintura: { value: 0.6 },
    uRugosidadeDaPintura: { value: 0.36 },
    uCorDoTeto: { value: new Color(0.006, 0.0065, 0.007) },
    uTetoPreto: { value: 0 },
    uTetoVidro: { value: 0 },
    uFarol: { value: 0 },
    uLanterna: { value: 0 },
    uCorDoFarol: { value: COR_DO_FAROL.clone().multiplyScalar(6) },
    uCorDaLanterna: { value: COR_DA_LANTERNA.clone().multiplyScalar(5) },
  };
}

export type RegioesDaMascara = {
  excluir: readonly RegiaoDoCarro[];
  vidro: readonly RegiaoDoCarro[];
  teto: readonly RegiaoDoCarro[];
  metal: readonly RegiaoDoCarro[];
  farol: readonly RegiaoDoCarro[];
  lanterna: readonly RegiaoDoCarro[];
};

export type FaixasDaMascara = Record<keyof RegioesDaMascara, [number, number]>;

const CABECALHO_DO_VERTICE = 'varying vec3 vPosCarro;\nvoid main() {';
const POSICAO_NO_CARRO = '#include <worldpos_vertex>\n\tvPosCarro = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;';

/**
 * As declarações e funções da máscara (antes do `main`): o peso das regiões, o OKLab e a conta que
 * decide, para um texel numa posição do carro, quanto é pintura, vidro e metal, e a cor tingida.
 * O shader da cena e o da exportação USDZ usam a mesma.
 */
function glslDaMascara(n: number, faixas: FaixasDaMascara): string {
  const f = (nome: keyof FaixasDaMascara) => `${faixas[nome][0]}, ${faixas[nome][1]}`;
  return /* glsl */ `
varying vec3 vPosCarro;
uniform vec4 uRegioes[ ${Math.max(1, n) * 2} ];
uniform vec3 uCorDaPintura;
uniform float uMetalDaPintura;
uniform float uRugosidadeDaPintura;
uniform vec3 uCorDoTeto;
uniform float uTetoPreto;
uniform float uTetoVidro;
uniform vec3 uBaseLab;
uniform float uLumBase;
uniform float uTolerancia;
uniform float uTingir;
uniform float uTingirMetal;
uniform float uFarol;
uniform float uLanterna;
uniform vec3 uCorDoFarol;
uniform vec3 uCorDaLanterna;

// Peso de um ponto numa região: caixa inclinada em X (tipo 0) ou cilindro deitado em X (tipo 1).
float carPesoDaRegiao( int i, vec3 p ) {
	vec4 a = uRegioes[ i * 2 ];
	vec4 b = uRegioes[ i * 2 + 1 ];
	vec3 d = p - a.xyz;
	float fora;
	if ( a.w > 0.5 ) {
		fora = max( length( d.yz ) - b.x, abs( d.x ) - b.y );
	} else {
		float c = cos( b.w );
		float s = sin( b.w );
		vec3 q = abs( vec3( d.x, c * d.y + s * d.z, - s * d.y + c * d.z ) ) - b.xyz;
		fora = max( q.x, max( q.y, q.z ) );
	}
	return 1.0 - smoothstep( ${(-BORDA_DA_REGIAO / 2).toFixed(4)}, ${(BORDA_DA_REGIAO / 2).toFixed(4)}, fora );
}

float carPesoEntre( int de, int ate, vec3 p ) {
	float w = 0.0;
	for ( int i = 0; i < ${Math.max(1, n)}; i ++ ) {
		if ( i >= de && i < ate ) w = max( w, carPesoDaRegiao( i, p ) );
	}
	return w;
}

vec3 carOklab( vec3 c ) {
	float l = pow( max( 0.0, 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b ), 1.0 / 3.0 );
	float m = pow( max( 0.0, 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b ), 1.0 / 3.0 );
	float s = pow( max( 0.0, 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b ), 1.0 / 3.0 );
	return vec3(
		0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s );
}

// A mesma conta de mascaraDaPintura (cores.ts).
float carMascaraDaCor( vec3 cor, float metal ) {
	vec3 lab = carOklab( cor );
	float distancia = max( length( lab.yz - uBaseLab.yz ) * 2.0, abs( lab.x - uBaseLab.x ) );
	return ( 1.0 - smoothstep( uTolerancia * 0.55, uTolerancia, distancia ) ) * max( uTingirMetal, 1.0 - smoothstep( 0.35, 0.65, metal ) );
}

struct CarMascara { float pintura; float vidro; float metal; float lum; vec3 tingido; };

// Para um texel (a cor como está no arquivo) numa posição do carro: quanto é pintura, vidro e metal.
// No teto por região, a pintura vale mesmo onde o assado é mais claro, e o teto pode ser preto ou
// de vidro (panorâmico).
CarMascara carMascara( vec3 texel, float metal, vec3 p ) {
	CarMascara r;
	float teto = carPesoEntre( ${f('teto')}, p );
	r.vidro = max( carPesoEntre( ${f('vidro')}, p ), teto * uTetoVidro );
	r.lum = dot( texel, vec3( 0.2126, 0.7152, 0.0722 ) );
	float cor = max( carMascaraDaCor( texel, metal ), teto );
	r.pintura = uTingir * cor * ( 1.0 - carPesoEntre( ${f('excluir')}, p ) ) * ( 1.0 - r.vidro );
	float razao = mix( clamp( r.lum / uLumBase, 0.0, 1.3 ), 1.0, teto );
	r.tingido = mix( uCorDaPintura, uCorDoTeto, teto * uTetoPreto ) * razao;
	r.metal = carPesoEntre( ${f('metal')}, p ) * smoothstep( 0.08, 0.28, r.lum );
	return r;
}
`;
}

function corpoDaMascara(faixas: FaixasDaMascara): { pintura: string; verniz: string; luzes: string } {
  const f = (nome: keyof FaixasDaMascara) => `${faixas[nome][0]}, ${faixas[nome][1]}`;
  return {
    pintura: /* glsl */ `#include <metalnessmap_fragment>
	// A cor como está no arquivo: o texel da textura (sem o fator do material) ou, sem textura, o fator.
	#ifdef USE_MAP
		vec3 carTexel = diffuseColor.rgb / max( diffuse, vec3( 1e-4 ) );
	#else
		vec3 carTexel = diffuse;
	#endif
	CarMascara carM = carMascara( carTexel, metalnessFactor, vPosCarro );
	diffuseColor.rgb = mix( diffuseColor.rgb, carM.tingido, carM.pintura );
	roughnessFactor = mix( roughnessFactor, uRugosidadeDaPintura, carM.pintura );
	metalnessFactor = mix( metalnessFactor, uMetalDaPintura, carM.pintura );
	// Rodas: a parte clara vira alumínio polido.
	roughnessFactor = mix( roughnessFactor, 0.3, carM.metal );
	metalnessFactor = mix( metalnessFactor, 0.85, carM.metal );
	// Vidro assado: o que a textura mostra, bem mais escuro, liso e sem metal.
	diffuseColor.rgb *= mix( 1.0, 0.2, carM.vidro );
	roughnessFactor = mix( roughnessFactor, 0.12, carM.vidro );
	metalnessFactor = mix( metalnessFactor, 0.0, carM.vidro );`,
    verniz: /* glsl */ `#include <lights_physical_fragment>
	#ifdef USE_CLEARCOAT
		material.clearcoat = saturate( material.clearcoat * carM.pintura + 0.35 * carM.vidro );
		material.clearcoatRoughness = mix( material.clearcoatRoughness, min( 0.1 + geometryRoughness, 1.0 ), carM.vidro );
	#endif`,
    luzes: /* glsl */ `#include <emissivemap_fragment>
	float carVermelho = clamp( ( carTexel.r - max( carTexel.g, carTexel.b ) ) * 8.0, 0.0, 1.0 );
	// Só acende o que não é lataria: a região pega um pouco de para-choque em volta da lente.
	float carNaoPintura = 1.0 - carM.pintura;
	totalEmissiveRadiance += uCorDoFarol * uFarol * carPesoEntre( ${f('farol')}, vPosCarro ) * smoothstep( 0.16, 0.5, carM.lum ) * carNaoPintura;
	totalEmissiveRadiance += uCorDaLanterna * uLanterna * carPesoEntre( ${f('lanterna')}, vPosCarro ) * ( 0.3 + 0.7 * carVermelho ) * carNaoPintura;`,
  };
}

/**
 * Injeta a pintura por máscara num material físico do arquivo. `tingir: false` deixa só as regiões
 * (vidro, metal e luzes): é o caso dos materiais excluídos da máscara.
 */
export function injetarMascara(
  material: MeshPhysicalMaterial,
  opcoes: { base: Rgb; tolerancia: number; regioes: RegioesDaMascara; uniformes: UniformesDaPintura; tingir: boolean; tingirMetal?: boolean },
): void {
  const { regioes } = opcoes;
  const ordem = ['excluir', 'vidro', 'teto', 'metal', 'farol', 'lanterna'] as const;
  const todas = ordem.flatMap((nome) => regioes[nome]);
  let inicio = 0;
  const faixas = Object.fromEntries(
    ordem.map((nome) => {
      const r: [number, number] = [inicio, inicio + regioes[nome].length];
      inicio += regioes[nome].length;
      return [nome, r];
    }),
  ) as FaixasDaMascara;
  const lab = linearParaOklab(opcoes.base);
  const locais = {
    // Array plano de floats: o three passa direto para o uniform de vec4[].
    uRegioes: { value: empacotarRegioes(todas) },
    uBaseLab: { value: new Vector3(lab[0], lab[1], lab[2]) },
    uLumBase: { value: Math.max(1e-4, luminancia(opcoes.base)) },
    uTolerancia: { value: opcoes.tolerancia },
    uTingir: { value: opcoes.tingir ? 1 : 0 },
    uTingirMetal: { value: opcoes.tingirMetal ? 1 : 0 },
  };
  // A pintura por máscara substitui o acabamento do arquivo onde tinge (iridescência e brilho de
  // tecido não combinam com a cor nova).
  if (opcoes.tingir) {
    material.iridescence = 0;
    material.sheen = 0;
  }
  const corpo = corpoDaMascara(faixas);
  const declaracoes = glslDaMascara(todas.length, faixas);
  const chave = `carrelio:mascara:${todas.length}:${Object.values(faixas).flat().join(',')}`;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, opcoes.uniformes, locais);
    shader.vertexShader = shader.vertexShader.replace('void main() {', CABECALHO_DO_VERTICE).replace('#include <worldpos_vertex>', POSICAO_NO_CARRO);
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `${declaracoes}\nvoid main() {`)
      .replace('#include <metalnessmap_fragment>', corpo.pintura)
      .replace('#include <lights_physical_fragment>', corpo.verniz)
      .replace('#include <emissivemap_fragment>', corpo.luzes);
  };
  material.customProgramCacheKey = () => chave;
  // Para a exportação USDZ assar a cor tingida na textura com a mesma conta.
  material.userData['mascara'] = { uniformes: opcoes.uniformes, locais, declaracoes } satisfies DadosDaMascara;
  material.needsUpdate = true;
}

export type DadosDaMascara = {
  uniformes: UniformesDaPintura;
  locais: Record<string, { value: unknown }>;
  /** As declarações GLSL da máscara (`glslDaMascara`), já com as faixas deste material. */
  declaracoes: string;
};

// ------------------------------------------------------------------- conversões

/**
 * Um material físico com as propriedades de um padrão (o GLTFLoader cria padrões quando o arquivo
 * não usa extensões físicas). `copy` do físico leria campos que o padrão não tem.
 */
export function paraFisico(m: MeshStandardMaterial): MeshPhysicalMaterial {
  if ((m as MeshPhysicalMaterial).isMeshPhysicalMaterial) return m as MeshPhysicalMaterial;
  const f = new MeshPhysicalMaterial();
  MeshStandardMaterial.prototype.copy.call(f, m);
  f.defines = { STANDARD: '', PHYSICAL: '' };
  return f;
}
