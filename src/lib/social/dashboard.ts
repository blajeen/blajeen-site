import { contasPublicas, configurado } from './oauth';
import { historico } from './repository';
import type { PainelSocial } from './types';
export async function carregarPainelSocial(): Promise<PainelSocial> {
  const [contas, publicacoes] = await Promise.all([contasPublicas(), historico()]);
  return { contas, publicacoes, armazenamento: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    provedores: { meta: configurado('meta'), youtube: configurado('youtube'), twitter: configurado('twitter'), tiktok: configurado('tiktok') },
    avisos: [!process.env.BLOB_READ_WRITE_TOKEN ? 'O armazenamento de mídia ainda precisa ser configurado no servidor.' : '', (process.env.SOCIAL_TOKEN_SECRET?.length ?? 0) < 32 ? 'A chave de segurança das conexões ainda precisa ser configurada.' : ''].filter(Boolean),
  };
}
