import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import nextConfig from '../../next.config';
import { morvelio } from '@/content/projects';
import { OG } from '@/lib/metadata';

describe('Entrega de imagens', () => {
  it('serve arquivos locais sem depender do otimizador bloqueado da hospedagem', () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
  });

  it('usa o ícone oficial do Morvelio no site e no compartilhamento', () => {
    expect(morvelio.icone?.src).toBe('/projects/morvelio/morvelio-icon-montanha-toon-512.webp');
    expect(OG.morvelio).toBe(morvelio.icone?.src);
    expect(existsSync(join(process.cwd(), 'public', OG.morvelio))).toBe(true);
  });
});
