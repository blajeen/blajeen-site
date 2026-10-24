import { MAX_IMAGEM, MAX_VIDEO, REDES } from './types';
import type { ContaSocial, TipoMidia } from './types';

export function validarArquivo(nome: string, mime: string, tamanho: number): TipoMidia {
  const video = mime === 'video/mp4' && /\.mp4$/i.test(nome);
  const imagem = (mime === 'image/jpeg' && /\.jpe?g$/i.test(nome)) || (mime === 'image/png' && /\.png$/i.test(nome));
  if (!video && !imagem) throw new Error('Use um vídeo MP4 ou uma imagem JPG/PNG.');
  if (!Number.isSafeInteger(tamanho) || tamanho <= 0 || tamanho > (video ? MAX_VIDEO : MAX_IMAGEM)) {
    throw new Error(video ? 'O vídeo deve ter até 500 MB.' : 'A imagem deve ter até 5 MB.');
  }
  return video ? 'video' : 'image';
}

export function uuid(valor: unknown): string {
  if (typeof valor !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor)) {
    throw new Error('Identificador inválido. Atualize a página e tente novamente.');
  }
  return valor;
}

export function validarPublicacao(input: Record<string, unknown>, tipo: TipoMidia, contas: ContaSocial[]) {
  const id = uuid(input.id);
  const arquivoId = uuid(input.arquivoId);
  const legenda = typeof input.legenda === 'string' ? input.legenda.trim() : '';
  if (!legenda || legenda.length > 2200) throw new Error('Escreva uma legenda de até 2.200 caracteres.');
  if (!Array.isArray(input.contas) || !input.contas.length || input.contas.length > REDES.length) throw new Error('Escolha pelo menos uma rede.');
  const ids: string[] = input.contas;
  if (ids.some((id) => typeof id !== 'string') || new Set(ids).size !== ids.length) throw new Error('Seleção de contas inválida.');
  const destinos = ids.map((id) => {
    const conta = contas.find((c) => c.id === id && c.disponivel);
    if (!conta) throw new Error('Uma das contas precisa ser reconectada. Atualize as conexões.');
    if (tipo === 'image' && conta.rede === 'youtube') throw new Error('O YouTube recebe vídeos. Remova o YouTube para enviar uma imagem.');
    if (conta.rede === 'twitter' && Array.from(legenda).length > 280) throw new Error('Para usar a mesma legenda no X, escreva até 280 caracteres ou desmarque o X.');
    return conta;
  });
  if (new Set(destinos.map((c) => c.rede)).size !== destinos.length) throw new Error('Escolha apenas uma conta por rede.');
  return { id, arquivoId, legenda, destinos };
}
