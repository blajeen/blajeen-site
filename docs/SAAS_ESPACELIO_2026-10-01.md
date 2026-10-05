# SaaS — Espacelio e Doutelio (1º de outubro de 2026)

> **Substituído em 5 de outubro de 2026.** O Espacelio e o Pipelio não chegaram a existir, e os
> seis sistemas viraram software à venda na loja (`/loja`, categoria Software). As páginas descritas
> aqui saíram e os endereços antigos redirecionam para a loja; `tools/check-saas-pages.mjs` deu lugar
> a `tools/check-software-loja.mjs`. Ver `docs/loja/IMPLEMENTACAO.md` — Software. Este registro fica
> como histórico.

## Pedido

O titular pediu para tratar os SaaS como "SaaS Blajeen Labs" com dois produtos: o **Espacelio**,
que reúne os sistemas para negócios locais numa página só e resumida, e o **Doutelio**, que
continua separado. Barbelio, Beautelio, Studelio, Foodelio e Lojalio estão se juntando no
Espacelio; o Pipelio vira o módulo de CRM (ainda em breve) e os painéis de gestão viram uma seção.

## O que mudou no site

- **Menu:** Produtos → SaaS mostra Espacelio e Doutelio (desktop, gaveta do celular e rodapé).
- **`/projects`** ("SaaS Blajeen Labs"): dois cartões, Espacelio (com atalhos para cada módulo) e
  Doutelio.
- **`/projects/espacelio`**: uma página com uma seção por módulo (`#barbearias`, `#estetica`,
  `#estudios`, `#restaurantes`, `#lojas`), o CRM em breve (`#crm`) e os painéis (`#paineis`).
  Cada módulo mantém a sua demonstração atual, o briefing de contratação e o contato.
- **Doutelio** segue em `/projects/doutelio` (e `/projects/clinica-medica`), sem mudança.
- **Endereços antigos** (`/projects/barbelio`, `/projects/barbearia`, `/projects/beautelio`,
  `/projects/salao-estetica`, `/projects/studelio`, `/projects/personal-studio`,
  `/projects/lojalio`, `/projects/ecommerce`, `/projects/foodelio`, `/projects/pipelio` e
  `/projects/painel-administrativo`) redirecionam de forma permanente para a seção do módulo no
  Espacelio (`next.config.ts`). Os formulários de contratação (`/projects/<produto>/formulario`)
  continuam no mesmo endereço, e o "voltar" deles leva à seção certa.
- As novidades antigas sobre cada sistema passaram a apontar para a seção do módulo. A novidade
  de 2 de setembro ("Seis SaaS ativos") ficou como registro histórico.

## O que não foi inventado

O Espacelio ainda não tem site, demonstração ou conta única própria: a página diz que os sistemas
"estão se juntando" nele e usa as demonstrações atuais de cada módulo. A seção de painéis mantém o
aviso de que os exemplos vêm de módulos diferentes e não representam uma conta única que controla
todos os segmentos. Quando o Espacelio tiver endereço e demonstração próprios, eles entram em
`espacelio` (`src/content/saas.ts`).

## Verificação

- `src/content/saas.test.ts`: menu e rodapé com Espacelio e Doutelio, endereço de cada módulo,
  redirecionamento de cada sistema antigo e páginas antigas removidas.
- `node tools/check-saas-pages.mjs <origem>`: Doutelio, vitrine, as seções do Espacelio, os 11
  redirecionamentos (308 para a seção certa), a home e o Morvelio. A etapa seguinte do script, do
  Docalio, já falhava antes desta mudança: a página mostra "Em breve na Google Play" e o script
  proíbe a frase.
- `npm run qa:conduto` nas páginas de SaaS e na home: sem invasões.
