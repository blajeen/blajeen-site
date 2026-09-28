# Portfólio: site e painel

## Resultado da revisão

| Projeto | Site | Administração |
|---|---|---|
| Dom Guima | Capturas existentes da loja | Captura real enviada pelo titular: domguima painel.jpg |
| Spot Hotel | Capa atual extraída da entrega de 27/09 | Painel - Spot Hotel e Pousada.png; relatórios extraídos da página 2 da entrega |
| Pousada Dona Lia | Capa atual extraída da entrega de 27/09 | Painel - Pousada Dona Lia.png; guia mobile extraído da página 2 da entrega |
| Agro Weld | Capturas existentes do site | Demonstrativo da proposta, explicitamente identificado; não tratado como captura de produção |
| Lina Art Pet | Site, configurador e imagens dos trabalhos existentes | Não encontrado painel administrativo no material auditado; não acrescentada imagem fictícia |

Arquivos fornecidos na Área de Trabalho convertidos para WebP sem alterar o conteúdo. Nenhum PDF de entrega foi colocado em public: publicados somente os elementos visuais pertinentes. O material de acesso privado não integra a entrega pública.

Cartões de projetos com duas prévias; páginas com bloco site/painel, legendas, links de ampliação e material complementar. Hotéis atualizados para “No ar” conforme documento final de entrega de 27/09.

## Verificação

TypeScript e ESLint dos arquivos alterados aprovados. tools/qa-portfolio-pairs.mjs verifica cinco páginas em 390 e 1440 px: resposta HTTP, legendas, decodificação das imagens, ausência de overflow horizontal e erros de JavaScript. Revisão visual local realizada em Spot desktop e Dona Lia mobile; espaço vertical das capturas mobile ajustado.

O catálogo vive em src/content/portfolio.ts. WorkCard e WorkDetail consomem o campo opcional painel; demonstracao distingue material de proposta das capturas reais.
