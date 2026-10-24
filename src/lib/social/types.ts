export const REDES = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'] as const;
export type Rede = typeof REDES[number];
export const NOME_REDE: Record<Rede, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', twitter: 'X / Twitter', facebook: 'Facebook',
};
export type TipoMidia = 'image' | 'video';
export type ContaSocial = { id: string; rede: Rede; nome: string; disponivel: boolean; motivo: string | null };
export type EstadoEnvio = 'pendente' | 'enviando' | 'aceito' | 'publicado' | 'falhou' | 'incerto' | 'acao';
export type EnvioSocial = { id: string; rede: Rede; contaId: string; contaNome: string; estado: EstadoEnvio; remotoId: string | null; erro: string | null };
export type PublicacaoSocial = { id: string; legenda: string; arquivoNome: string; tipo: TipoMidia; criadoEm: string; envios: EnvioSocial[] };
export type ArquivoSocial = { id: string; pathname: string; url: string | null; nome: string; tipo: TipoMidia; mime: string; tamanho: number; criadoEm: string };
export type PainelSocial = { contas: ContaSocial[]; publicacoes: PublicacaoSocial[]; avisos: string[]; armazenamento: boolean; provedores: Record<'meta' | 'youtube' | 'twitter' | 'tiktok', boolean> };
export type ContaPrivada = { id: string; rede: Rede; nome: string; token: string; refresh: string | null; expiraEm: number | null };
export type OAuthPendente = { id: string; provedor: string; nonceHash: string; verificador: string; sessao: string; expiraEm: number };
export const ESTADO_ENVIO: Record<EstadoEnvio, string> = {
  pendente: 'Aguardando envio', enviando: 'Enviando', aceito: 'Recebido para publicação',
  publicado: 'Publicado', falhou: 'Não enviado', incerto: 'Conferir na rede antes de reenviar',
  acao: 'Finalize no TikTok',
};
export const MAX_VIDEO = 500 * 1024 * 1024;
export const MAX_IMAGEM = 5 * 1024 * 1024;
