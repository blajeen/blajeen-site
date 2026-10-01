# Blajeen Labs: loja de exclusivos

## Pedido

Em 01/10/2026 o titular pediu uma aba de exclusivos para vender produtos da Blajeen Labs: um boneco 3D, uma camiseta e uma caneca de cada jogo, o copo e a camiseta da marca, e o Livro de Morvelio em duas versões (digital e física de colecionador). Tudo deveria nascer "Em breve", com imagens simples e simbólicas, e ser editável no painel: nome, descrição, preço, fotos e a saída de "Em breve". No mesmo dia, pediu compra real, com pagamento pelo Asaas e frete pelo Melhor Envio.

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

Os 24 produtos de `src/lib/loja/exemplos.ts` entram uma vez só, na primeira leitura da loja (marcados em `admin_settings` como `loja:exemplos`). Apagado no painel, um exemplo não volta. As imagens são montagens ilustrativas geradas por `node tools/gerar-artes-da-loja.mjs` com os ícones reais dos jogos, marcadas como "imagem ilustrativa"; são trocadas pelas fotos reais pelo painel.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/loja/tipos.ts` | Tipos, rótulos e regras simples (preço, "Em breve") |
| `src/lib/loja/validacao.ts` | O que o painel e o checkout aceitam; cálculo do pedido; CPF/CNPJ |
| `src/lib/loja/repositorio.ts` | Produtos, fotos, pedidos, eventos do webhook e configuração (Neon ou `.data/loja.json`) |
| `src/lib/loja/asaas.ts` | Cliente e cobrança no Asaas; token e eventos do webhook |
| `src/lib/loja/melhor-envio.ts` | Cotação de frete |
| `src/components/loja/*` | Vitrine, produto, sacola e checkout |
| `src/components/admin/AdminLoja*.tsx` | Painel |
| `migrations/005_loja.sql` | Tabelas `store_products`, `store_orders` e `store_payment_events` |

## Verificação

- `src/lib/loja/loja.test.ts`: preço em reais, CPF/CNPJ, "Em breve" sem preço e bloqueio de venda sem preço, pacote de frete, cálculo do pedido pelo catálogo (com itens repetidos, esgotado, rascunho e opção removida), endereço só quando há envio, CPF exigido no pagamento online, armadilha de robôs, token e eventos do webhook, vencimento da cobrança e o catálogo de exemplo inteiro (imagens existentes e validação do painel).
- Percurso local com Playwright: vitrine em 1440 e 390 px, livro "Em breve" sem botão de compra, produto colocado à venda pelo painel (e recusado sem preço), pedido pela sacola e o pedido no painel.
- O pagamento real (Asaas) e a cotação real (Melhor Envio) só podem ser testados com as chaves: comece pelo sandbox dos dois.

## Pendências

- `lojaRetencao` e `lojaCondicoes` (ver `docs/DECISOES_ANTES_DE_PUBLICAR.md` — Loja): prazo de guarda dos pedidos; troca, devolução, reembolso, entrega do e-book e endereço do fornecedor exigido pelo Decreto 7.962/2013. Os textos da loja na Política de Privacidade e nos Termos precisam da revisão do titular.
- A etiqueta de envio continua sendo comprada no painel do Melhor Envio; o site só cota e guarda a opção escolhida.
