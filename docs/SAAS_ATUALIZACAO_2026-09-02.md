# SaaS — atualização de 2 de setembro de 2026

## Escopo e fonte

Atualização solicitada pelo proprietário: seis SaaS ativos, Pipelio em breve,
novos endereços e descrições aprovadas. A fonte editorial única é
`src/content/saas.ts`, consumida pela home, catálogo, menu e páginas de produto.
As rotas antigas foram preservadas para não quebrar links existentes.

Sites e demos retornaram HTTP 200 na conferência de origem. Os textos usam os
recursos informados pelo proprietário e a apresentação pública de cada SaaS.
Não foram criados preços, métricas, clientes ou integrações. Os planos e as
condições ficam no próprio produto. O agendamento do Barbelio é uma solicitação
sem criação de conta, sujeita à confirmação pela barbearia.

## Imagens

São exatamente três imagens diferentes por produto. A primeira é a capa; as
outras duas mostram partes da operação. Não há repetição da capa em uma galeria
de dez telas. O enquadramento 16:10 usa contain, sem recortar ou esticar a tela.
As imagens podem ser ampliadas em nova aba. Os arquivos WebP mantêm a dimensão
original e são servidos localmente, sem depender da disponibilidade das demos.

As capas de Beautelio, Barbelio, Studelio, Foodelio e Lojalio foram capturadas
das demos públicas, em 1265 × 712, sem login ou dados de clientes. As demais
imagens vieram da galeria pública dos próprios produtos. Algumas são prévias
ilustrativas de painel: isso está explícito nas legendas, sem apresentá-las
como captura de uma operação real.

| Produto | Imagem 1 | Imagem 2 | Imagem 3 |
| --- | --- | --- | --- |
| Doutelio | Agenda: imagens/produto/01-agenda.png | Prontuário: imagens/produto/03-prontuario.png | Portal: imagens/produto/10-portal.png |
| Beautelio | Demo /loja | Agenda: product-shots/02.png | Portfólio: product-shots/07.png |
| Barbelio | Demo /barbearia-aurora-demo | Agenda: product-shots/03.png | Visão geral: product-shots/01.png |
| Studelio | Demo /estudio/studio-move-demo | Agenda: product-shots/02.png | Planos: product-shots/05.png |
| Foodelio | Demo /cardapio/sabor-da-vila-demo | Fila de preparo: product-shots/03.png | Cardápio: product-shots/04.png |
| Lojalio | Demo /loja | Marca e canais: product-shots/06.png | Estoque: product-shots/04.png |

O script `tools/sync-saas-assets.mjs` atualiza somente as imagens oficiais da
galeria. As capas capturadas não são sobrescritas pelo script. As legendas
descrevem o conteúdo visual conferido, pois alguns rótulos na galeria de origem
não correspondiam à tela exibida.

## Painéis e personalização

Sem endereço ou confirmação de um painel universal entre todos os produtos, a
página de gestão apresenta os painéis de cada SaaS, disponíveis no respectivo
produto. Não promete uma conta única de controle de todos os sistemas.

Os briefings existentes permanecem acessíveis para personalizações já alinhadas
com a equipe. Conhecer o produto e abrir a demo não exigem preencher o briefing.
Adaptações adicionais têm escopo e condições avaliados antes da implementação.

Jogos, documentos legais e suas rotas não foram alterados. Novidades antigas
permanecem como histórico datado, com um novo anúncio dos seis SaaS disponíveis.
