import { describe, expect, it, vi } from 'vitest';
import { verificarEnvio } from './publish';
import type { ContaPrivada, EnvioSocial } from './types';

vi.mock('./oauth', () => ({ tokenDaConta: vi.fn(async () => 'token'), bearer: () => ({}), api: vi.fn(), graph: vi.fn() }));
import { api } from './oauth';

const conta: ContaPrivada = { id: 'tiktok:1', rede: 'tiktok', nome: 'Teste', token: '', refresh: null, expiraEm: null };
const envio: EnvioSocial = { id: '1', contaId: conta.id, contaNome: conta.nome, rede: 'tiktok', estado: 'acao', remotoId: 'v_inbox~1', erro: null };

describe('estado do envio ao TikTok', () => {
  it.each([
    ['PROCESSING_UPLOAD', 'aceito'], ['SEND_TO_USER_INBOX', 'acao'],
    ['PUBLISH_COMPLETE', 'publicado'], ['FAILED', 'falhou'],
  ] as const)('interpreta %s como %s', async (status, estado) => {
    vi.mocked(api).mockResolvedValueOnce({ data: { status, fail_reason: 'file_format_check_failed' } });
    const resultado = await verificarEnvio(conta, envio);
    expect(resultado?.estado).toBe(estado);
    if (estado === 'falhou') expect(resultado?.erro).toContain('file_format_check_failed');
  });
});

