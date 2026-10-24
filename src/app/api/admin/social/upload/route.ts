import { handleUpload } from '@vercel/blob/client';
import type { HandleUploadBody } from '@vercel/blob/client';
import { protegerSocial } from '@/lib/social/http';
import { lerArquivo, salvarArquivo } from '@/lib/social/repository';
import { uuid, validarArquivo } from '@/lib/social/validation';
import { MAX_IMAGEM, MAX_VIDEO } from '@/lib/social/types';

export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    if (body.type !== 'blob.upload-completed') { const bloqueio = await protegerSocial(request); if (bloqueio) return bloqueio; }
    const result = await handleUpload({ request, body,
      onBeforeGenerateToken: async (pathname, payload) => {
        const info = JSON.parse(payload || '{}') as { nome: string; mime: string; tamanho: number };
        const match = /^social\/([a-f0-9-]{36})\.(mp4|jpg|jpeg|png)$/.exec(pathname);
        if (!match) throw new Error('Caminho inválido.');
        const id = uuid(match[1]); const tipo = validarArquivo(info.nome, info.mime, info.tamanho);
        if (await lerArquivo(id)) throw new Error('Este envio já foi iniciado. Selecione o arquivo novamente.');
        await salvarArquivo({ id, pathname, url: null, nome: info.nome.slice(0, 180), mime: info.mime, tamanho: info.tamanho, tipo, criadoEm: new Date().toISOString() });
        return { allowedContentTypes: [info.mime], maximumSizeInBytes: tipo === 'video' ? MAX_VIDEO : MAX_IMAGEM, addRandomSuffix: false, allowOverwrite: false, validUntil: Date.now() + 60 * 60 * 1000 };
      },
      onUploadCompleted: async () => { /* A confirmação autenticada valida o objeto por head e assinatura de arquivo. */ },
    });
    return Response.json(result);
  } catch { return Response.json({ error: 'Não foi possível autorizar o upload. Confira armazenamento, formato e tamanho do arquivo.' }, { status: 400 }); }
}
