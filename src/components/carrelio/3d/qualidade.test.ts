import { describe, expect, it } from 'vitest';
import { ajustesDoCarro, desenhaSemGpu, escolherNivel, ORCAMENTO_DO_CARRO } from './qualidade';

describe('os ajustes de qualidade do carro', () => {
  it('reaproveita a escolha de nível do Torrelio', () => {
    expect(escolherNivel({ ponteiroGrosso: true, nucleos: 8, memoriaGb: 8, economiaDeDados: false, largura: 390 })).toBe('medio');
  });

  it('dá reflexos nítidos, MSAA e halos ao computador, e economiza no celular fraco', () => {
    const alto = ajustesDoCarro('alto', 1);
    expect(alto).toMatchObject({ dpr: 1, msaa: true, reflexos: 512, halos: true, sombraDeContato: 1024 });
    expect(ajustesDoCarro('alto', 2).msaa).toBe(false);
    expect(ajustesDoCarro('alto', 3).dpr).toBe(2);
    const medio = ajustesDoCarro('medio', 3);
    expect(medio).toMatchObject({ dpr: 2, msaa: false, reflexos: 256, halos: true, sombraDeContato: 512 });
    const baixo = ajustesDoCarro('baixo', 3);
    expect(baixo).toMatchObject({ dpr: 1.25, reflexos: 256, halos: false, sombraDeContato: 256, anisotropia: 1 });
    expect(ORCAMENTO_DO_CARRO.celular.chamadas).toBeLessThanOrEqual(40);
  });

  it('reconhece quem desenha sem GPU pelo nome do renderizador', () => {
    expect(desenhaSemGpu('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)')).toBe(true);
    expect(desenhaSemGpu('llvmpipe (LLVM 15.0.7, 256 bits)')).toBe(true);
    expect(desenhaSemGpu('ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0)')).toBe(true);
    expect(desenhaSemGpu('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe(false);
    expect(desenhaSemGpu('Apple GPU')).toBe(false);
    expect(desenhaSemGpu('Adreno (TM) 640')).toBe(false);
    expect(desenhaSemGpu('')).toBe(false);
  });
});
