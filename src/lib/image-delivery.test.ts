import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import nextConfig from '../../next.config';
import { dogolio } from '@/content/projects';
import { OG } from '@/lib/metadata';

describe('Entrega de imagens', () => {
  it('serve arquivos locais sem depender do otimizador bloqueado da hospedagem', () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
  });

  it('usa o novo ícone versionado do Dogolio no site e no compartilhamento', () => {
    expect(dogolio.icone?.src).toBe('/projects/dogolio/dogolio-icon-cyberpunk-gray-512.webp');
    expect(OG.dogolio).toBe(dogolio.icone?.src);
    expect(existsSync(join(process.cwd(), 'public', OG.dogolio))).toBe(true);
  });
});
