# Painel comercial — pedidos, contratos, catálogo e relatórios

Pedido do titular em 30/09/2026: transformar a área administrativa em um painel completo da Blajeen
Labs. O painel usa a mesma senha e sessão das Novidades (`ONBOARDING_ADMIN_PASSWORD`,
`ONBOARDING_SESSION_SECRET`) e o mesmo banco Neon (`DATABASE_URL`).

## Telas

| Rota | O que faz |
|---|---|
| `/admin` | Visão geral: indicadores do ano, pendências e recebido por mês |
| `/admin/pedidos` | Pedidos do “Crie seu projeto”: situação, anotações, resposta por WhatsApp/e-mail e “Criar contrato” |
| `/admin/contratos` | Cria e edita contratos, gera o link do cliente, abre o PDF e registra assinatura, entrada e saldo |
| `/admin/catalogo` | Edita preços, prazos, mensalidades, adicionais, validade e hora técnica; gera o PDF do catálogo |
| `/admin/relatorios` | Mês a mês, por serviço, funil de pedidos e planilha CSV dos contratos |
| `/admin/novidades` | Novidades do site (já existia) |
| `/contrato/[token]` | Página do cliente: resumo, contrato completo e envio dos dados do CONTRATANTE |

Documentos imprimíveis (HTML completo, fora do layout do site):
`/admin/contratos/[id]/documento`, `/admin/catalogo/documento` e `/contrato/[token]/documento`.
Usam `public/documentos/*.css` e fontes auto-hospedadas em `public/documentos/fonts` (SIL OFL).

## Fluxo

1. O visitante envia o “Crie seu projeto” → `POST /api/pedidos` grava em `admin_project_requests` e
   avisa o estúdio por e-mail (Resend, se configurado).
2. No painel, “Criar contrato” abre o formulário já com nome, e-mail, telefone e a ideia do pedido.
   O titular define plano, **valor vendido**, prazo, pagamento, parcelamento e “O combinado”.
3. O painel gera o número (`BJL-SITE-2026-001`) e um link de 256 bits. O banco guarda o hash; a
   cópia do link fica criptografada (mesma função do onboarding).
4. O cliente confere o resumo, lê o contrato, preenche os próprios dados e aceita. Depois do envio o
   link fica somente leitura; “Reabrir para o cliente” libera correções.
5. O titular salva o PDF e envia para assinatura eletrônica (ZapSign, Autentique…). No painel,
   registra “assinado”, “entrada recebida” (50%) e “saldo recebido” (50%) — é isso que alimenta os
   relatórios.

Política de pagamento do estúdio, padrão em todos os contratos: 50% adiantado e 50% no final, com
parcelamento com juros por conta do cliente.

## Textos dos contratos

`src/content/contratos/modelos.generated.ts` é gerado pelo kit comercial
(`Blajeen Labs - Kit Comercial/_fonte`, `python build.py --site <repo>`). As cláusulas vêm de
`_fonte/contratos.py`; os preços-base, de `_fonte/dados.py`. `{{campo|exemplo|padrão|opcional}}` e
`[[caixa|rótulo|grupo]]` são resolvidos por `src/lib/contracts/documento.ts`, que escapa todo valor
vindo do painel ou do cliente. Os preços publicados em `/admin/catalogo` ficam em `admin_settings` e
sobrescrevem os preços-base sem alterar o arquivo gerado.

Os modelos precisam de revisão jurídica antes de uso em escala.

## Banco

`migrations/004_painel_comercial.sql` cria `admin_project_requests`, `admin_contracts` e
`admin_settings`. Em produção a migration roda no `prebuild`. Sem `DATABASE_URL`, o desenvolvimento
usa `.data/pedidos.json` e `.data/contratos.json`; produção recusa operar sem banco.

## E-mail

Avisos de novo pedido e de contrato preenchido usam `RESEND_API_KEY`, `ONBOARDING_EMAIL_FROM` e
`ONBOARDING_NOTIFICATION_EMAIL`. Sem essas variáveis nada é enviado, e os registros continuam no
painel (a tela de pedidos mostra “Aviso por e-mail: não configurado”).

## Privacidade

`/privacy` ganhou a seção “Pedidos de projeto e contratos”. O prazo de guarda é o bloqueador humano
`comercialRetencao` e não pode ser estimado.
