# Analytics → Morvelio

Rotas privadas: `/admin/analytics`, `/admin/analytics/morvelio`, alias `/admin/morvelio`
e `GET /api/admin/analytics/morvelio`. Todas exigem a sessão existente do painel.
`?exemplo=1` na página ou API retorna somente números fictícios, sem chamar provedores,
gravar histórico ou enviar e-mail. Faça a revisão nesse modo antes de publicar.

Organização da página: no topo, sempre visível, o **resumo do que importa** (contas novas em 7 dias com a comparação
com os 7 anteriores, volta depois de 1 dia, ativos em 3 dias, maior parada da jornada, jogadores no Cerco, travamentos
e ANR com alerta acima de 1% e 0,4%). Abaixo, abas: **Jogadores**, **Jornada**, **Cerco**, **Estabilidade**, **Lojas**
e **Conexões**. A aba aberta fica no link (`#jornada`, `#estabilidade`...); a faixa de abas gruda no topo ao rolar.
Sem referência confiável, volta, ativos e Cerco aparecem sem cor de bom/ruim: não inventamos meta.

## Google

1. No [Google Cloud](https://console.cloud.google.com/), selecione/crie um projeto e ative
   **Google Play Developer Reporting API** e **Google Play Android Developer API**.
2. Em IAM e administrador → Contas de serviço, crie uma conta específica para leitura do painel.
   Não é necessário conceder Owner/Editor do projeto.
3. Gere uma chave JSON dessa conta. Guarde-a fora do repositório. Codifique o arquivo em base64
   e salve o resultado na variável **de servidor** `GOOGLE_PLAY_SA_JSON` da Vercel.
   Exemplo PowerShell (não publique nem compartilhe a saída):
   `[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\caminho-privado\conta.json'))`.
4. No Play Console → Usuários e permissões, convide o `client_email` do JSON.
   Conceda acesso ao Morvelio (`br.com.morvelio`), visualização de informações do app e relatórios.
   A API de avaliações também exige **Responder a avaliações**; o painel só faz GET e não responde.
5. Para instalações, copie o nome `pubsite_prod_...` do endereço Cloud Storage em
   **Fazer download de relatórios → Estatísticas** para `GOOGLE_PLAY_REPORTS_BUCKET` (sem `gs://`).
   É necessário acesso de conta para visualizar informações e baixar relatórios em lote.
   Essa permissão de conta permite ler informações não financeiras de todos os apps atuais e futuros;
   a permissão de responder avaliações pode continuar restrita ao Morvelio.
   O Google informa que mudanças de permissão podem levar até 48 horas para propagar. Se as APIs
   funcionarem mas o bucket ainda responder 403, confira o acesso global salvo e aguarde a propagação;
   não conceda permissões de administrador para tentar contornar o atraso.
   Não torne o bucket público. O painel lê os CSVs mensais `..._app_version.csv` dos dois meses
   que cobrem os últimos 30 dias, com OAuth `devstorage.read_only`.

## Apple

1. No [App Store Connect](https://appstoreconnect.apple.com/), abra Usuários e Acesso →
   Integrações → App Store Connect API. Um administrador pode precisar habilitar o acesso primeiro.
2. Gere uma chave de equipe com o menor papel que permita **ler customerReviews**, como
   Customer Support ou Developer, conforme a matriz de acesso da conta. Sales sozinho não deve
   ser presumido suficiente para avaliações. O papel Customer Support permite consultar e responder
   avaliações; o painel faz somente consultas. **Chaves de equipe abrangem todos os apps da conta**;
   a Apple não permite restringir uma chave de equipe apenas ao Morvelio `6809216107`.
3. Anote **Key ID** e **Issuer ID** e baixe o `.p8` (a Apple permite baixar uma única vez).
4. Configure `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_PRIVATE_KEY` no servidor da Vercel.
   `ASC_PRIVATE_KEY` recebe o conteúdo PEM completo; aceita quebras reais ou `\n` literais.
   A chave não é enviada ao navegador. JWT ES256 dura 15 minutos.

## E-mail, banco e agendamento

- Reaproveita Resend: `RESEND_API_KEY` e `ONBOARDING_EMAIL_FROM` (remetente com domínio verificado).
  O remetente de teste do Resend só entrega ao titular da conta; use domínio verificado para Outlook.
- `MORVELIO_ALERT_EMAIL=blajeenlabs@outlook.com` (também é o padrão do código).
- Configure `DATABASE_URL` e rode `npm run db:migrate` para aplicar a migration 009.
  O prebuild já aplica migrations quando há banco configurado. PostgreSQL mantém as avaliações
  coletadas e os registros de envio; os segredos não são gravados nessas tabelas.
- Gere `CRON_SECRET` longo e aleatório. A Vercel o envia como `Authorization: Bearer ...`.
- `vercel.json` define `0 11 * * *`: **08:00 America/Sao_Paulo (UTC−3)**.
  A rota é `GET /api/cron/morvelio`; só o segredo de cron a autoriza, não a sessão de admin.
  Este arquivo configura o agendamento do app; não depende de uma automação do Codex.
- Verifique o plano da Vercel: no Hobby o disparo diário pode ocorrer dentro da hora agendada;
  para pontualidade às 08h, use um plano com agendamento preciso. Crons só rodam no deploy de produção.
- Sem banco/remetente/Resend, o cron responde 503 e não finge que enviou. A página continua funcionando.
  Uma reserva atômica no banco evita concorrência; o Resend recebe chave de idempotência por dia.
  Falhas podem ser repetidas chamando a rota com o mesmo segredo. A Vercel não garante retry automático.
  Não execute manualmente a rota só para testar layout: ela envia e-mail real.

O resumo tem 8 linhas, usa a data anterior de Brasília e destaca em vermelho e no assunto **ALERTA**:
crash > 1%, ANR > 0,4%, avaliação coletada de 1–2 estrelas ou queda ≥ 0,3 na média de uma loja.
Quando o dia anterior ainda não foi publicado, diz **sem dados**; nunca usa o último dia antigo como ontem.

## Métricas e limites

- Gráficos usam **userPerceivedCrashRate** e **userPerceivedAnrRate**, em pontos percentuais
  conforme o contrato da Reporting API. Linhas: 1,09% e 0,47%. São limites gerais de mau comportamento;
  o Google normalmente avalia 28 dias, não declara violação só por cruzar uma linha em um dia.
- Android vitals tem dias em `America/Los_Angeles`. O painel respeita `freshnessInfo.latestEndTime`,
  pagina as consultas, limita o período a 30 dias completos e mostra lacunas, sem preenchê-las com zero.
  Top 5 aparelhos soma `errorReportCount`, filtro `reportType = CRASH`, por modelo; não é ranking de taxa.
- As instalações são **Daily Device Installs**, e a distribuição por código de versão usa
  **Current Device Installs** no último dia disponível. Não são usuários únicos nem downloads iOS.
  Downloads iOS não estão integrados porque customerReviews não fornece essa informação.
- Médias: avaliações **com texto coletadas**, sete datas completas de Brasília versus sete anteriores.
  Não são a nota geral das lojas, nem todas as classificações sem texto. Google retorna avaliações
  recentes criadas/alteradas (janela de uma semana); o banco permite construir histórico dali em diante.
  O histórico inicial é parcial; a comparação só aparece se há amostra nas duas janelas.
  Edição de avaliação no Google conta na data de modificação. Apple informa data, mas não versão/idioma
  no endpoint usado; não inferimos idioma pelo território. A API pagina até cobrir 14 dias.
- Cache compartilhado do Next por fonte: revalidação de 3.600 segundos, incluindo falhas, sem botão
  de bypass que permita esgotar cotas. A revalidação pode servir uma resposta anterior enquanto atualiza.
  “Conexões e configuração” mostra a data de cada coleta. Troca das credenciais muda a chave do cache.
- A seção **Dentro do jogo** vem dos saves de produção do Unity; detalhes abaixo.

## Unity: telemetria pelos saves de produção

O jogo não manda eventos de analytics. A seção **Dentro do jogo** usa os saves que o próprio jogo sobe para o
Cloud Save, a mesma fonte de `C:\dev\morvelio\Tools\telemetria\funil_saves.py` (porte em `src/lib/analytics/unity.ts`):
lista de contas do Unity Authentication (`createdAt`, `lastLoginAt`, `externalIds`) e os itens Protected
`morvelio_save_v1_account`, `morvelio_save_v1_slot0..10` (`value.data` = base64 de gzip de JSON) e `morvelio_royale_v1`.
Leitura autorizada pelo PO para métricas agregadas. **A tela mostra só agregados, nunca id nem nome de jogador.**

O que aparece, para “Todas as contas” e “Criadas nos últimos 7 dias”:
contas, vinculadas × convidados (convidado não sobe save), volta depois de 1/3/7 dias (**aproximada**: último acesso
menos criação, não é DAU), ativos nos últimos 3 dias, Cerco (% que jogou, mediana de partidas, % só Cerco = zero quest
principal concluída), economia (medianas de `gold` e `gems.balance` do save da conta) e **onde a campanha parou** (a primeira quest
**principal**, na ordem do catálogo do jogo, que o aventureiro mais adiantado não concluiu; quest ainda fora da lista
do save conta como não concluída; nenhuma faltando = FIM; com o título PT). O número da quest não é a ordem: J68 e J69
são opcionais (entre J27 e J28), a J67 e as J64–J66 vêm antes da J60 no catálogo e a J70 é a última principal. Mais contas novas por dia (Brasília, 30 dias).
Continuam **Em breve**: *Escolha inicial* (o jogo grava `firstMode` só em PlayerPrefs do aparelho, não no save) e *Vendas*
(o saldo de gemas não separa compra de prêmio). Não inventar número para elas.

### Como funciona

- `GET /api/cron/morvelio-saves`, diário às `30 10 * * *` UTC = **07:30 Brasília** (`vercel.json`), só com `CRON_SECRET`.
- Lista todas as contas (1 requisição por 1000 contas) e relê o save só de quem pode ter mudado: conta nova, login novo
  desde a última leitura, ou ativa nas 24 h antes da última leitura. Guarda por conta um **resumo anônimo** em
  `morvelio_unity_accounts` (hash sha256 do id, datas, vinculada, quest onde parou, partidas, ouro e gemas; sem id, nome
  nem save bruto) e grava o agregado em `morvelio_unity_snapshots`. A página lê só o último snapshot.
- Cada resumo grava a versão da regra (`SUMMARY_RULE` em `unity.ts`). Ao mudar a regra do resumo, suba esse número:
  a coleta seguinte relê todos os saves, inclusive de quem não jogou (cabe no limite de 900 enquanto houver menos contas).
- Conta que sumiu do Unity Authentication (excluída) é apagada de `morvelio_unity_accounts` na coleta seguinte.
- Limites: Cloud Save Admin aceita 1000 requisições por 30 min por projeto. Cada coleta lê no máximo **900** saves, com
  8 em paralelo e corte aos 200 s (a função tem 300 s). Ao receber 429 a coleta para e grava o que leu. O que faltar
  aparece em vermelho na tela e é lido na próxima coleta. A primeira coleta lê todo mundo (~840 contas hoje); as
  seguintes leem só quem jogou. Não rode o `funil_saves.py` na mesma meia hora do cron: dividem o mesmo limite.
- Pode chamar a rota de novo com o segredo para completar uma coleta parcial: ela só lê o que falta e **não envia e-mail**.
- Títulos e ordem das quests: o deploy não enxerga o repositório do jogo, então os títulos PT vivem em
  `src/lib/analytics/quest-titles.json` e a lista ordenada das principais (do `MvlCampaignQuestCatalogData.cs`, só
  `optional == false`, com constantes como `MvlSeaCove.Quest` resolvidas) em `src/lib/analytics/main-quests.json`.
  Mesma regra de `main_journey()` do `funil_saves.py`. Quando o jogo ganhar, renomear ou reordenar quests, rode
  `npm run titulos:quests` (ou `node tools/copiar-titulos-quests.mjs C:\caminho\do\morvelio`) e commite os dois JSON.

### Ligar com dados reais (o que só o PO faz)

1. **Unity Cloud Dashboard** (cloud.unity.com) → menu da organização → Administration → **Service Accounts → New**.
   Nome: `blajeen-site-leitura`. Em **Project roles**, no projeto do Morvelio, adicione só leitura:
   **Cloud Save Viewer** e o papel de visualização do **Player Authentication** (precisa do escopo
   `player_auth.users.list`; o nome exato do papel não foi confirmado na documentação). Nada de Owner, Editor ou papel
   de organização. Depois **Keys → Add key** e copie Key ID e Secret key (o secret aparece uma vez).
2. Anote no dashboard o **Project ID** do Morvelio e, em Projects → Environments, o **id** (não o nome) do `production`.
3. **Vercel** → projeto do site → Settings → Environment Variables → Production. Cole exatamente:

   | Variável | Valor |
   |---|---|
   | `UGS_PROJECT_ID` | Project ID do Morvelio |
   | `UGS_ENVIRONMENT_ID` | id do ambiente `production` |
   | `UGS_SERVICE_ACCOUNT_KEY_ID` | Key ID da service account |
   | `UGS_SERVICE_ACCOUNT_SECRET` | Secret key da service account |

   `DATABASE_URL` e `CRON_SECRET` já existem se o resumo das 08h funciona; senão, configure-os também.
4. O deploy aplica a migration 010 sozinho (prebuild com `DATABASE_URL`). A primeira coleta roda às **07:30**. Para ver
   na hora, depois do deploy, rode uma vez (PowerShell; troque o segredo, não cole a saída em lugar público):
   `Invoke-RestMethod https://<domínio>/api/cron/morvelio-saves -Headers @{ Authorization = "Bearer <CRON_SECRET>" }`
   A resposta traz só contagens: `total` (contas), `read` (saves lidos), `failed`, `pending`.
   Se vier “Nenhum save lido do Cloud Save”, confira o papel Cloud Save Viewer e o `UGS_ENVIRONMENT_ID`.

### Testar o caminho real no computador, antes do deploy

1. Crie `.env.local` na raiz do site (já ignorado pelo git) com as quatro `UGS_*` acima, `DATABASE_URL` (Neon),
   `CRON_SECRET` (qualquer valor longo), `ONBOARDING_ADMIN_PASSWORD` e `ONBOARDING_SESSION_SECRET` (para entrar no painel).
   O `DATABASE_URL` de produção funciona: as tabelas são as mesmas que o cron vai usar. Para isolar, use um branch do Neon.
2. `node --env-file=.env.local tools/migrate-onboarding.mjs` (aplica a migration 010).
3. `npm run dev` e, em outro terminal:
   `Invoke-RestMethod http://127.0.0.1:3000/api/cron/morvelio-saves -Headers @{ Authorization = "Bearer <CRON_SECRET do .env.local>" }`
   A primeira vez lê todas as contas (cerca de 1 minuto).
4. Entre em `http://127.0.0.1:3000/admin/analytics/morvelio` (sem `?exemplo=1`). Os números devem bater com o
   `relatorio.md` do `funil_saves.py` do mesmo dia (mesma regra; pequenas diferenças vêm de contas que jogaram no meio).
Não confirmado só pela documentação, e por isso conferido neste primeiro teste: a rota dos itens Protected do Cloud Save
(`.../players/{id}/protected/items?keys=...`) e a unidade de `createdAt`/`lastLoginAt` (o código aceita segundos,
milissegundos ou ISO).

Sem as variáveis ou sem banco, a tela diz o que falta e o cron responde 503; nada é inventado.
Fontes consultadas em 27/11/2026: [Player Authentication Admin API](https://services.docs.unity.com/player-auth-admin/v1/),
[Cloud Save Admin API](https://services.docs.unity.com/cloud-save-admin/v1/),
[autenticação por service account](https://services.docs.unity.com/docs/service-account-auth/).

## Validar

`npm run typecheck`, `npm run test`, `npm run build`.
Depois de `npm run dev`, entre pelo login existente e abra
`http://127.0.0.1:3000/admin/analytics/morvelio?exemplo=1`.
Alterne “Ver dados reais” para conferir estados sem credenciais.
Os testes simulam APIs (incluindo Unity Authentication e Cloud Save), paginação, CSV UTF-16, isolamento de falhas, limites e autenticação do cron;
não exigem nem usam credenciais reais.

Fontes oficiais consultadas em 14/11/2026:

- [Reporting API: crash rate](https://developers.google.com/play/developer/reporting/reference/rest/v1beta1/vitals.crashrate)
- [Limites Android vitals](https://support.google.com/googleplay/android-developer/answer/9844486)
- [Avaliações Play e permissões](https://developers.google.com/android-publisher/reply-to-reviews)
- [Relatórios de instalações](https://support.google.com/googleplay/android-developer/answer/6135870)
- [Permissões e prazo de propagação do Play](https://developers.google.com/android-publisher/api-ref/rest/v3/users#DeveloperLevelPermission)
- [Customer reviews Apple](https://developer.apple.com/documentation/appstoreconnectapi/get-v1-apps-_id_-customerreviews)
- [Escopo de chaves de equipe Apple](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api)
- [Vercel Cron](https://vercel.com/docs/cron-jobs/usage-and-pricing)
