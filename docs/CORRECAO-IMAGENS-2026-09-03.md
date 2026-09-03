# Correção de imagens — 3 de setembro de 2026

## Causa comprovada

Os arquivos locais retornavam HTTP 200, mas o caminho de otimização `/_next/image` retornava HTTP 402 com `OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED` para as fotos SaaS e o ícone do Dogolio. Uma captura no navegador confirmou cartões com imagens quebradas.

## Correção

- `images.unoptimized: true`: o Next Image preserva dimensões, layout e carregamento adiado, mas referencia o arquivo estático diretamente. Nenhum plano, cobrança ou proteção de segurança foi alterado.
- As 18 fotos SaaS continuam em WebP. O ícone novo do Dogolio usa um WebP de 512 × 512, aproximadamente 64 KB, com nome versionado para não reutilizar o cache da arte anterior.
- A nova arte mostra um cachorro mais velho, cinza-escuro, metade mecânico, em estilo cartoon, de costas em um prédio com vista para a cidade cyberpunk.
- Arquivo original e exportações PNG preservados no projeto e em `C:\dev\dogolio`. Prompt da geração integrada: `C:\dev\dogolio\PROMPT-ICONE-CINZA-CYBERPUNK.md`.

## Prevenção de regressão

O teste de configuração impede a reativação acidental do caminho bloqueado. `node tools/check-saas-pages.mjs https://blajeen.com.br` verifica também as URLs reais de `img/srcset`, HTTP 200, tipo e dimensões dos arquivos, além dos conteúdos SaaS e do ícone novo do Dogolio. Verificar apenas a existência da imagem original não é suficiente.

A entrega estática transfere a imagem na dimensão do arquivo. Manter novas fotografias e artes da interface compactadas antes de publicar; não enviar originais grandes diretamente aos cartões.
