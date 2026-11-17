# Recraw 0.1.1

- Página: `https://www.blajeen.com.br/produtos/recraw`.
- Distribuição: `https://github.com/blajeen/recraw-download/releases/tag/v0.1.1`.
- O repositório de distribuição é público e contém README, hashes e pacotes compilados;
  o código-fonte do aplicativo não faz parte desta publicação.
- Instalador: 17.282.770 bytes. Portátil: 17.865.395 bytes. Tamanhos no site usam MB decimal.
- Os hashes em `src/content/recraw.ts` correspondem aos pacotes baixados por acesso anônimo
  após a publicação da release. O guia e `SHA256SUMS.txt` também acompanham a release.
- O aplicativo é para Windows 10/11 x64, usa WebView2 e ainda não tem assinatura digital.
- As capturas são reais, da interface 0.1.1; o quadro mostra uma imagem de exemplo.
- A página informa que transcrição e resumo acontecem em outra ferramenta e que os ensaios
  de gravação realizados ainda são curtos, sem validação de reuniões de várias horas.

## Verificação do site

Lint, TypeScript e build de produção conferidos. A suíte geral passou em 447 testes, com duas
exclusões e um timeout no teste preexistente da câmera 3D do Torrelio; os sete testes desse
arquivo passaram na repetição isolada. Rotas, conteúdo e navegação foram repetidos após
incluir o grupo de produtos no rodapé.

QA da página em 1440, 390 e 360 pixels: downloads versionados, imagens carregadas, hashes
acessíveis, ausência de scroll horizontal e de erros de JavaScript. Catálogo, menu, rodapé
e sitemap incluem a rota do produto.

O portão de conteúdo normal está consistente. A checagem global com `SITE_PUBLICACAO=1`
continua apontando 21 pendências anteriores do site (documentação jurídica e materiais de
outros produtos). Esta alteração não resolve essas pendências nem publica novas políticas.

## Próxima versão

Publicar uma nova tag e atualizar os nomes, tamanhos, hashes e a base versionada em
`src/content/recraw.ts`, junto dos links do guia e metadados necessários. Não substituir
silenciosamente os arquivos de uma versão já distribuída.
