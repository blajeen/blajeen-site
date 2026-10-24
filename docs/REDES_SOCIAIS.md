# Redes sociais do titular

Pedido de 24/10/2026: no painel existente, enviar uma imagem ou vídeo e a mesma legenda para
Instagram, TikTok, YouTube, X e Facebook. O titular escolheu integração direta, sem Buffer ou
outro intermediário de publicação. A interface está em `/admin/redes-sociais`.

## Operação

1. Conectar as contas em **Suas contas**.
2. Selecionar uma imagem JPG/PNG de até 5 MB ou MP4 vertical 9:16, de 4 a 60 segundos, até 500 MB.
   O limite de duração/resolução no navegador é um perfil comum conservador; a validação final
   de codecs, proporção e requisitos pertence também às redes. Exportar vídeo H.264 e áudio AAC.
3. Escrever a legenda. Com X selecionado, o painel limita a legenda comum a 280 caracteres;
   regras de contagem específicas do X ainda são verificadas pela API. Sem X, até 2.200.
4. Publicar. Contas disponíveis começam selecionadas. O botão indica quantos destinos receberão.
5. Conferir o histórico. O painel distingue publicação confirmada, processamento e ação manual.

Imagens não vão ao YouTube: sua API de upload recebe vídeos, não posts de imagem da Comunidade.
Imagens são normalizadas para JPEG, com redução proporcional até 1080 × 1920 quando necessário
para uso no Instagram; não há recorte ou corte de texto.
Para vídeos YouTube, o título obrigatório vem da primeira linha da legenda, até 90 caracteres.
A privacidade solicitada é pública. Público infantil não é declarado automaticamente pelo painel:
conferir a configuração do canal e os requisitos do projeto Google no YouTube Studio.

No TikTok, esta implementação usa **Upload**, não Direct Post. O arquivo é enviado à caixa de
entrada para o titular finalizar no aplicativo. Para vídeos, o endpoint não recebe a legenda;
o histórico tem **Copiar legenda** para colar no TikTok. Para fotos, a descrição acompanha o envio.
O status “Finalize no TikTok” não significa publicado nem confirma que o arquivo já terminou de
processar. O TikTok precisa aprovar o escopo de upload; limites de uso continuam aplicáveis.

## Configuração de produção

Não colar senhas ou tokens no chat. Cadastrar segredos nas variáveis de ambiente do servidor:

- `DATABASE_URL`, mesma instância Neon do painel; aplicar `008_redes_sociais.sql` pelo fluxo existente.
- `BLOB_READ_WRITE_TOKEN`, armazenamento **público** Vercel Blob, com upload direto autorizado.
- `SOCIAL_TOKEN_SECRET`, segredo exclusivo aleatório de pelo menos 32 caracteres.
- `NEXT_PUBLIC_SITE_URL`, domínio HTTPS definitivo, sem depender de host fornecido na requisição.
- Credenciais de cada aplicativo listadas em `.env.example`.

O recurso usa a hospedagem Vercel e o banco Neon já previstos no site. O armazenamento de mídia
pertence à hospedagem; não há envio para agregadores de publicação. Mídias são acessíveis pelo
link de armazenamento para as redes buscá-las. Não enviar material privado a este fluxo.

### Meta: Instagram e Facebook

Cadastrar aplicativo Meta e configurar Facebook Login para aplicação Web. Informar a versão
suportada pelo aplicativo em `SOCIAL_META_API_VERSION` (formato `vNN.0`).

URL de retorno:
`https://blajeen.com.br/api/admin/social/oauth/meta/callback`.

Permissões solicitadas: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`,
`instagram_basic`, `instagram_content_publish`. Confirmar no console os níveis de acesso,
aprovações e papéis necessários ao aplicativo e à conta real.

Autorizar a Página do Facebook e vincular a conta profissional de Instagram à Página.
O fluxo importa até 100 Páginas autorizadas e seus perfis profissionais vinculados. Se houver
mais de uma conta por rede, o titular seleciona qual usar; não publica em todas as Páginas.
O Facebook pessoal não é um destino suportado.

### YouTube

Habilitar YouTube Data API no Google Cloud; criar cliente OAuth Web.
URL de retorno: `https://blajeen.com.br/api/admin/social/oauth/youtube/callback`.

Escopos: `youtube.upload` e `youtube.readonly`; acesso offline para renovação.
Cadastrar o titular como usuário de teste enquanto necessário e conferir expiração de tokens,
verificação de OAuth, quota e eventuais exigências de auditoria do projeto antes do uso normal.
O canal é identificado pela API, não pelo texto digitado pelo usuário.

### X

Criar aplicativo Web confidencial, habilitar OAuth 2.0 e cadastrar o retorno:
`https://blajeen.com.br/api/admin/social/oauth/twitter/callback`.

Escopos: `tweet.read`, `tweet.write`, `users.read`, `offline.access`, `media.write`.
Conferir disponibilidade dos endpoints e créditos no plano real da API do X.
Upload usa a API v2 de mídia; vídeos passam por inicialização, partes, finalização e processamento.

### TikTok

Cadastrar aplicativo Web, Login Kit e Content Posting API com escopos `user.info.basic` e
`video.upload`. Retorno: `https://blajeen.com.br/api/admin/social/oauth/tiktok/callback`.

Para fotos, verificar o domínio `blajeen.com.br` ou o prefixo de mídia no console TikTok.
O painel fornece uma URL assinada sob `/api/social/media/`, válida por 24 horas. Hospedar
qualquer arquivo de verificação exigido pelo console apenas após receber seu conteúdo real.
Vídeos usam upload binário por partes, dispensando busca por URL.

O aplicativo não solicita `video.publish` e não promete publicação pública automática para uso
exclusivamente pessoal. O modo Upload também depende de aprovação e permissões do TikTok.

Se o domínio do site for diferente, substituir o domínio em todas as URLs de retorno acima.
Credenciais de desenvolvimento e produção devem ter seus retornos cadastrados separadamente.

## Segurança e persistência

- Páginas e APIs administrativas usam a sessão existente. Mutações exigem origem do próprio site.
- OAuth iniciado por POST autenticado; estado de uso único com prazo de dez minutos, nonce em
  cookie HttpOnly/Lax e vínculo à sessão administrativa. Google e X usam PKCE.
- Tokens são cifrados com AES-256-GCM e a chave exclusiva; nenhum token de rede vai ao cliente.
  Trocar a chave exige reconectar as contas ou migrar os tokens antes da troca.
- A ação Desconectar apaga a credencial local. Revogar também o acesso na própria rede quando
  necessário; o botão não afirma revogar permissões remotamente.
- Uploads diretos têm autorização autenticada, prefixo restrito, tamanho/tipo limitado e proibição
  de sobrescrita. A confirmação usa `head` do armazenamento e verifica assinatura/formato real.
- Arquivo MP4 tem cabeçalho verificado no servidor. Duração/resolução são verificadas no navegador;
  não há transcodificação nem prova de codec no servidor. As redes podem rejeitar mídia incompatível.
- A CSP só libera upload externo na página privada de redes sociais; o restante do site é preservado.
- As tabelas `social_accounts`, `social_assets`, `social_posts`, `social_deliveries` e `social_oauth`
  ficam no Neon. Sem banco, somente desenvolvimento usa `.data/social.json`.

## Confiabilidade

O servidor registra o post e os destinos de forma atômica antes de enviar. Uma chave UUID do
cliente torna o registro idempotente. Cada destino é reservado por compare-and-set no banco;
duplo clique e requisições simultâneas não criam dois envios para o mesmo trabalho.

Os destinos iniciam em requisições separadas. Se o navegador fechar antes de disparar todos,
“Continuar envios pendentes” envia apenas os ainda não reservados. Uma falha numa rede preserva
os resultados das demais. Não há rollback de posts remotos.

Após timeout, o estado é incerto: não reenviar automaticamente. Trabalhos em envio há mais de
310 segundos aparecem como incertos; o titular precisa conferir o destino. IDs intermediários
ficam no histórico para diagnóstico. Não há garantia de entrega exatamente uma vez após falha de
rede; a estratégia evita retentativa cega que poderia duplicar conteúdo.

“Atualizar resultados” consulta YouTube/Facebook e conclui o contêiner de Instagram ainda em
processamento. A reserva atômica também protege essa operação. Processos longos precisam caber
na duração de função permitida pelo plano real da hospedagem; `maxDuration=300` não aumenta
um limite que o plano não permita. Esta versão é de publicação imediata, sem agenda/fila externa.

## Retenção e operação

Arquivos originais, JPEGs normalizados e histórico permanecem armazenados; não há limpeza
automática nesta versão. Definir retenção e rotina de exclusão com o titular antes de operar
em volume. Não apagar mídia ainda em processamento pelas redes. URLs assinadas do domínio
expiram em 24 horas, mas os arquivos do Blob continuam públicos por seus links.

A integração é privada e restrita ao titular; não há nova coleta de visitantes do site público.
Credenciais e publicação real exigem configuração nos consoles; a presença da tela não equivale
a contas conectadas. Nenhuma publicação de teste deve usar conteúdo real sem intenção do titular.

## Documentação oficial consultada

- Meta Instagram: https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- Meta Facebook Reels: https://github.com/fbsamples/Facebook-Reels-Publishing-API-Postman-Collection
- Google OAuth: https://developers.google.com/youtube/data/guides/auth/server-side-web-apps
- YouTube upload: https://developers.google.com/youtube/data/reference/rest/v3/videos/insert
- X OAuth: https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code
- X mídia: https://docs.x.com/x-api/media/quickstart/media-upload-chunked
- TikTok Upload: https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video
- TikTok fotos: https://developers.tiktok.com/docs/en/content-posting-api-reference-photo-post
- TikTok diretrizes: https://developers.tiktok.com/docs/en/content-sharing-guidelines
- Vercel upload: https://vercel.com/docs/vercel-blob/client-upload
