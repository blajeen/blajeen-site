import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateUpload } from './storage';

describe('uploads', () => {
  it('recusa arquivo executável mesmo com extensão de imagem', async () => {
    const file = new File([new Uint8Array([0x4d, 0x5a, 0x90, 0x00])], 'foto.png', { type: 'image/png' });
    await expect(validateUpload(file)).rejects.toThrow(/Formato não permitido/);
  });

  it('recusa SVG com script', async () => {
    const file = new File(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'], 'logo.svg', { type: 'image/svg+xml' });
    await expect(validateUpload(file)).rejects.toThrow(/executável/);
  });

  it('aceita PNG real e lê suas dimensões', async () => {
    const bytes = await readFile(resolve(process.cwd(), 'public', 'icon-32.png'));
    const file = new File([Uint8Array.from(bytes)], 'icone.png', { type: 'image/png' });
    const upload = await validateUpload(file);
    expect(upload.mimeType).toBe('image/png');
    expect(upload.width).toBe(32);
    expect(upload.height).toBe(32);
  });
});
