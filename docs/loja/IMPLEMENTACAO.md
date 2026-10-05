# Blajeen Labs: loja (software e exclusivos)

## Pedido

Em 01/10/2026 o titular pediu uma aba de exclusivos para vender produtos da Blajeen Labs: um boneco 3D, uma camiseta e uma caneca de cada jogo, o copo e a camiseta da marca, e o Livro de Morvelio em duas versões (digital e física de colecionador). Tudo deveria nascer "Em breve", com imagens simples e simbólicas, e ser editável no painel: nome, descrição, preço, fotos e a saída de "Em breve". No mesmo dia, pediu compra real, com pagamento pelo Asaas e frete pelo Melhor Envio. Depois, trouxe as imagens de cada produto (geradas à parte, a partir das artes dos jogos) e pediu tudo à venda com preço sugerido, a ajustar no painel, como produto feito sob encomenda, com entrega em 10 a 20 dias.

## Software (5 de outubro de 2026)

O titular pediu para vender os SaaS inteiros, numa categoria da loja chamada Software, e tirar a
categoria SaaS do site: Lojalio, Foodelio, Doutelio, Beautelio, Studelio e Barbelio, de R$ 1.500 a
R$ 3.500, com a demonstração e a explicação na página de cada um. É a venda inteira do código, um
produto único que não é vendido igual para outra pessoa; quem compra leva o site e a marca, pode
manter o nome ou pedir para o estúdio trocar, e começa o próprio negócio cuidando do SaaS. O
Espacelio e o Pipelio nunca chegaram a existir e saíram.

- **Vitrine:** a categoria Software vem primeiro, com uma apresentação curta (vendido inteiro, venda
  única, nome trocável) e cartões que mostram a tela inteira do sistema, na moldura das capturas,
  em vez do recorte quadrado das fotos dos exclusivos.
- **Página do sistema** (`/loja/<sistema>`): a tela da demonstração, o preço e "Comprar este
  sistema" ao lado de "Testar a demonstração"; o link do site, que vai junto na compra; como
  funciona a compra e o contato para dúvidas. Depois: o que vem na compra (código inteiro, site e
  marca, venda única, um negócio seu), o que o sistema faz (descrição, público, recursos e
  observações) e as outras duas telas, com as legendas que distinguem demonstração de prévia
  ilustrativa e o aviso de que as demos usam dados fictícios.
- **Venda única:** sem quantidade, na página, na sacola e no servidor (o pedido sai sempre com um).
  Quando o pagamento é confirmado — pelo webhook do Asaas ou pelo estúdio, ao marcar o pedido como
  pago no painel — o sistema vira "Esgotado" sozinho, e a loja o mostra como **Vendido**: sem preço,
  sem compra e sem os links da demonstração e do site, que passaram a ser de quem comprou. Pedido com
  sistema já vendido é recusado. O aviso de pedido pago ao estúdio diz que o sistema saiu de venda e
  que é hora de combinar a entrega do código.
- **De onde vem cada coisa:** preço, disponibilidade, resumo e descrição moram no produto da loja,
  editável no painel. A demonstração, o site, os recursos e as legendas das telas moram na ficha do
  sistema, em `src/content/software.ts`, e a página acha a ficha pelo endereço do produto — por isso
  o endereço dos seis não deve mudar no painel. Um software novo criado no painel aparece com o que
  vem na compra e a descrição, sem demonstração, até ganhar uma ficha.
- **Banco:** a tabela aceitava só as categorias dos exclusivos; a migration
  `007_loja_software.sql` troca a checagem para incluir `software`. Os seis produtos entram pelo
  código, num lote próprio (`loja:software` em `admin_settings`), na primeira leitura da loja depois
  do deploy, também no banco que já tinha os exclusivos. Se o lote falhar (a migration ainda não
  rodou, por exemplo), a vitrine continua com o que já existe e a próxima leitura tenta de novo.
- **Telas:** as capturas que eram dos SaaS mudaram para `public/loja/software/<sistema>/1..3.webp`;
  `tools/sync-software-assets.mjs` atualiza as prévias das galerias dos próprios produtos.
- **Site sem SaaS:** saíram o catálogo `/projects`, `/projects/espacelio` e `/projects/doutelio`
  (e `/projects/clinica-medica`), o grupo SaaS do menu, da gaveta e do rodapé. Em Produtos, o menu
  aponta "Software à venda" (`/loja#software`). Os endereços antigos redirecionam de vez: cada
  sistema para a página dele na loja; o catálogo, o Espacelio, o Pipelio e os painéis para
  `/loja#software`. As novidades antigas apontam para a loja, e o contato aceita `?produto=<sistema>`
  (os ids antigos, como `barbearia`, levam ao sistema certo). Os formulários de briefing
  (`/projects/<sistema>/formulario`) continuam no ar para quem já recebeu o link, voltando para a
  página do sistema na loja.
- **Textos legais:** a Política de Privacidade e os Termos falam da loja como "software e
  exclusivos", e os Termos ganharam um parágrafo sobre a venda de software. Como o resto da loja,
  esses textos precisam da revisão do titular.

## Como funciona

- **Vitrine** (`/loja`): produtos publicados, agrupados por categoria (bonecos 3D, camisetas, canecas e copos, livros). "Em breve" mostra "Preço em breve" e não tem botão de compra.
- **Produto** (`/loja/<endereço>`): galeria, opções (tamanho, versão), quantidade, "Adicionar à sacola" e "Pedir agora".
- **Sacola** (`/loja/pedido`, fora da busca): guardada no navegador da pessoa (`localStorage`), sem conta. Ela informa o CEP, escolhe o frete, preenche endereço, contato e CPF, e vai para a página de pagamento do Asaas (Pix, cartão ou boleto). O site nunca recebe dados de cartão.
- **Volta do pagamento** (`/loja/pedido/obrigado`): agradece e esvazia a sacola. Quem marca o pedido como pago é o webhook, não esta página.
- **Webhook** (`/api/loja/asaas`): valida o token, ignora evento repetido e cobrança que não é da loja, e leva o pedido a "Pago", "Cancelado" ou "Estornado". Ao ficar pago, avisa o estúdio por e-mail.

Preço e frete são sempre recalculados no servidor: o navegador só diz o que a pessoa escolheu. O frete escolhido é cotado de novo no momento do pedido e precisa bater com a opção oferecida.

### Sem as chaves

A loja nunca quebra por falta de configuração:

| Asaas | Melhor Envio | Resultado |
|---|---|---|
| sim | sim | pagamento online com frete calculado |
| sim | não | itens só digitais vão para o pagamento; com item físico, o pedido chega sem pagamento e o frete é combinado |
| não | qualquer | o pedido chega ao painel com o contato, e o estúdio combina frete e pagamento (aviso por e-mail) |

Se a cobrança do Asaas falhar na hora, o pedido fica registrado como "Novo", com o motivo nas anotações, e o estúdio recebe um aviso.

## Painel (`/admin/loja`)

- **Pedidos:** itens, frete, endereço, CPF, estado da cobrança no Asaas com link para ela, resposta pronta por WhatsApp ou e-mail, situação e anotações internas.
- **Produtos:** nome, resumo, descrição, categoria, jogo, disponibilidade, publicado ou rascunho, opções com preço (e se são digitais), pacote para o frete (peso e medidas) e fotos (enviar, descrever, reordenar e remover; a primeira é a capa). O painel não deixa tirar um produto de "Em breve" com alguma opção sem preço.
- **Frete e pagamento:** CEP de origem, dias úteis até postar, se o Asaas e o Melhor Envio estão ligados, e o endereço do webhook.

Salvar no painel atualiza na hora a vitrine, a página do produto e o sitemap.

## Configuração (uma vez)

As chaves ficam nas variáveis de ambiente da Vercel, nunca no código nem no painel. O modelo está em `.env.example`.

1. **Asaas:** gere a chave em Integrações → Chave de API e cadastre `ASAAS_API_KEY`. Para testar antes, use a conta sandbox com `ASAAS_AMBIENTE=sandbox`.
2. **Webhook do Asaas:** invente um token longo, cadastre-o em `ASAAS_WEBHOOK_TOKEN` e, no Asaas, em Integrações → Webhooks, aponte para `https://blajeen.com.br/api/loja/asaas` com o mesmo token e os eventos de cobrança.
3. **Melhor Envio:** gere um token com permissão de cálculo de frete e cadastre `MELHOR_ENVIO_TOKEN` (`MELHOR_ENVIO_AMBIENTE=sandbox` para testar).
4. **CEP de origem:** no painel, em Loja → Frete e pagamento.
5. Publique de novo (Redeploy) para as variáveis valerem.

Se o Asaas recusar o retorno automático ao site depois do pagamento, cadastre o domínio do site nas informações da conta do Asaas. Enquanto isso, a cobrança sai sem o retorno: a pessoa paga do mesmo jeito, só não volta sozinha.

## Catálogo e imagens de exemplo

Os 24 produtos de `src/lib/loja/exemplos.ts` entram uma vez só, na primeira leitura da loja (marcados em `admin_settings` como `loja:exemplos`). Apagado no painel, um exemplo não volta. Eles entram "Sob encomenda", com o preço sugerido de `PRECO_SUGERIDO`; no banco de produção, que já tinha os exemplos em "Em breve", preços, disponibilidade e descrições das imagens chegaram pela migration `006_loja_sob_encomenda.sql`, que só mexe no que ainda estava como o catálogo nasceu.

As imagens (`public/loja/exemplos/*.jpg`, 1400 px) são ilustrações do produto, geradas a partir das artes dos jogos; a vitrine e os Termos avisam que cor, acabamento e proporções do produto final podem ter pequenas diferenças. As montagens antigas e o script que as gerava saíram. Fotos de verdade chegam pelo painel.

### Sob encomenda

O prazo da encomenda (padrão: 10 a 20 dias, produção e transporte juntos) fica na configuração da loja, no painel. Ele aparece na página de cada produto sob encomenda, no quarto passo de "Como funciona o pedido" e na sacola. Quando o pacote leva um item físico sob encomenda, os dias para postar saem da cotação do frete (a produção já está no prazo da encomenda) e cada opção de frete mostra só o tempo do transporte.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/loja/tipos.ts` | Tipos, rótulos e regras simples (preço, "Em breve", venda única do software) |
| `src/lib/loja/validacao.ts` | O que o painel e o checkout aceitam; cálculo do pedido; CPF/CNPJ |
| `src/lib/loja/repositorio.ts` | Produtos, fotos, pedidos, eventos do webhook e configuração (Neon ou `.data/loja.json`) |
| `src/lib/loja/asaas.ts` | Cliente e cobrança no Asaas; token e eventos do webhook |
| `src/lib/loja/melhor-envio.ts` | Cotação de frete |
| `src/components/loja/*` | Vitrine, produto, página do software (`PaginaDoSoftware`), sacola e checkout |
| `src/content/software.ts` | Ficha de cada sistema: demonstração, site, recursos, telas e preço sugerido |
| `src/lib/loja/exemplos.ts` | Os exclusivos com que a loja nasceu e o software (`SOFTWARE_DA_LOJA`) |
| `src/components/admin/AdminLoja*.tsx` | Painel |
| `migrations/005_loja.sql` | Tabelas `store_products`, `store_orders` e `store_payment_events` |
| `migrations/007_loja_software.sql` | Categoria `software` na checagem de `store_products` |

## Verificação

- `src/lib/loja/loja.test.ts`: preço em reais, CPF/CNPJ, "Em breve" sem preço e bloqueio de venda sem preço, pacote de frete, cálculo do pedido pelo catálogo (com itens repetidos, esgotado, rascunho e opção removida), endereço só quando há envio, CPF exigido no pagamento online, armadilha de robôs, token e eventos do webhook, vencimento da cobrança e o catálogo de exemplo inteiro (imagens existentes e validação do painel).
- Percurso local com Playwright: vitrine em 1440 e 390 px, livro "Em breve" sem botão de compra, produto colocado à venda pelo painel (e recusado sem preço), pedido pela sacola e o pedido no painel.
- O pagamento real (Asaas) e a cotação real (Melhor Envio) só podem ser testados com as chaves: comece pelo sandbox dos dois.
- Software (05/10/2026): `src/lib/loja/loja.test.ts` (venda única: sempre um, recusa do vendido, rótulo "Vendido"), `src/lib/loja/repositorio.test.ts` (o lote do software entra numa loja nova e na que já tinha os exclusivos, uma vez só; o pago sai de venda sem mexer nos exclusivos, e repetir não muda nada) e `src/content/software.test.ts` (os seis sistemas, demonstração e site, preços de R$ 1.500 a R$ 3.500, o que vem na compra, telas locais e distintas, catálogo validado pelo painel, migration 007, páginas de SaaS apagadas, redirecionamentos, menu, rodapé e novidades). A migration 007 rodou num Postgres local (PGlite) com o mesmo separador de comandos do `tools/migrate-onboarding.mjs`: aceita `software` e continua recusando categoria desconhecida. No mesmo Postgres, com o protocolo do Neon simulado, o repositório semeou os 30 produtos numa base nova e só os seis sistemas numa base que já tinha os exclusivos, marcou o vendido uma vez só e, sem a migration 007, manteve a vitrine com os exclusivos e completou o lote depois que ela rodou. Com o site rodando, `node tools/check-software-loja.mjs <origem>` confere a vitrine, as seis páginas, as imagens servidas e os 15 redirecionamentos; o `qa:conduto` passou sem invasões na vitrine, nas páginas do software, na sacola e nas páginas de texto alteradas, em 390, 768, 1366 e 1440 px.

## Pendências

- `lojaRetencao` e `lojaCondicoes` (ver `docs/DECISOES_ANTES_DE_PUBLICAR.md` — Loja): prazo de guarda dos pedidos; troca, devolução, reembolso, entrega do e-book e endereço do fornecedor exigido pelo Decreto 7.962/2013. Os textos da loja na Política de Privacidade e nos Termos precisam da revisão do titular.
- A etiqueta de envio continua sendo comprada no painel do Melhor Envio; o site só cota e guarda a opção escolhida.
