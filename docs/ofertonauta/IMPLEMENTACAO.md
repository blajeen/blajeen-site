# Ofertonauta na Blajeen Labs

Preparado em 10/11/2026. Checkout: C:/dev/blajeen-site, origem blajeen/blajeen-site, branch base main.

## Entrega

- Produto em `/produtos/ofertonauta`, com arte oficial copiada do app atual.
- Item no menu Produtos (desktop e celular), grupo Aplicativos e comunidades.
- Card no catálogo Produtos; removida desse cabeçalho a generalização de que nenhum produto usa conta/servidor.
- Documentos próprios em `/ofertonauta/privacy`, `/ofertonauta/support`, `/ofertonauta/terms` e `/ofertonauta/delete-account`.
- Inclusão no registro de rotas/sitemap, links relacionados e rodapé de exclusão.
- Contato: ofertonauta.admin@gmail.com, confirmado pelo titular durante a tarefa.

## Estado de publicação

Publicação autorizada expressamente pelo titular em 10/11/2026: “pode publicar sim” e “e pode publicar os textos juridicos”. A autorização abrange a página de produto e os quatro documentos, como versão de trabalho, mantendo as pendências explícitas e o contato ofertonauta.admin@gmail.com. O estado de conteúdo permanece `preparacao`, pois a autorização de colocar no ar não define controlador, prazos ou conclusão da revisão jurídica. Esta decisão do titular autoriza esta publicação específica apesar das pendências genéricas do CLAUDE.md.

Persistem as definições existentes do site sobre controlador, canal formal de titulares e prazos de retenção/exclusão. `SITE_PUBLICACAO=1` continua com os bloqueadores humanos preexistentes; esta mudança não os contorna.

## Verificação

- Build Next.js e tipos compilados.
- 64 testes de conteúdo, navegação e rotas passaram depois da atualização das expectativas para os cinco novos caminhos e o canal próprio.
- Suite completa inicial: 430 passaram, 2 ignorados e 4 falharam por expectativas antigas dessas mesmas três suites. As quatro expectativas foram atualizadas, e todas as 64 verificações das suites afetadas passaram. Não foi repetida a suite inteira depois dessas correções.
- HTTP 200 sem autenticação: Produtos, página do Ofertonauta, quatro documentos e sitemap; documentos incluem o e-mail correto no HTML.
- Conferência visual de produto e privacidade no navegador; viewport mobile 390×844 sem overflow horizontal. Capturas em `preview-produto.png` e `preview-privacidade-mobile.png`.

## Correspondência com o aplicativo

Fontes lidas em C:/dev/ofertonauta: mobile/app.json, mobile/package.json, mobile/src/lib/supabase.ts, mobile/src/lib/api.ts, perfil, dados de métricas web e migrações. Site web existente: https://ofertonauta.vercel.app. Não há links confirmados de fichas nas lojas; a página não inventa botões de instalação.

Não identificado no app atual: ação interna de iniciar exclusão de conta. A página web oferece solicitação por e-mail e descreve a limitação, mas não implementa exclusão no aplicativo nem remove dados ao abrir o link. Conferir o procedimento de atendimento, exclusão, backups e pacote final antes do envio às lojas.

Referências oficiais consultadas em 10/11/2026:
- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- https://developer.apple.com/support/offering-account-deletion-in-your-app/
- https://support.google.com/googleplay/android-developer/answer/13327111
