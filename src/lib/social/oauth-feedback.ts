export const ERROS_CONEXAO = {
  expirada: 'Esta autorização expirou ou ficou incompleta. Clique em Conectar / reconectar e conclua a autorização em até 10 minutos.',
  'sem-pagina': 'A Meta autorizou o aplicativo, mas não retornou nenhuma Página. Em Editar configurações, selecione a Página Blajeen Labs e permita o acesso solicitado.',
  cancelada: 'A autorização foi cancelada na rede. Você pode iniciar a conexão novamente.',
  erro: 'A rede não concluiu a conexão. Confira as credenciais, a URL de retorno e as permissões do aplicativo.',
} as const;

export type FalhaConexao = keyof typeof ERROS_CONEXAO;
export class ErroConexaoSocial extends Error {
  constructor(public readonly motivo: FalhaConexao) { super(ERROS_CONEXAO[motivo]); }
}
export function mensagemConexao(codigo: string): string {
  return Object.hasOwn(ERROS_CONEXAO, codigo) ? ERROS_CONEXAO[codigo as FalhaConexao] : '';
}
