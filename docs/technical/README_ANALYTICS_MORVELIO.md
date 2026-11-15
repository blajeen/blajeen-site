# Analytics → Morvelio

Rotas privadas: `/admin/analytics`, `/admin/analytics/morvelio`, alias `/admin/morvelio`
e `GET /api/admin/analytics/morvelio`. Todas exigem a sessão existente do painel.
`?exemplo=1` na página ou API retorna somente números fictícios, sem chamar provedores,
gravar histórico ou enviar e-mail. Faça a revisão nesse modo antes de publicar.

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
- Unity permanece desligado em `readUnity()`. Os seis espaços estão identificados como **Em breve**;
  integrar somente quando o contrato de telemetria da versão 1.3.7 estiver disponível.

## Validar

`npm run typecheck`, `npm run test`, `npm run build`.
Depois de `npm run dev`, entre pelo login existente e abra
`http://127.0.0.1:3000/admin/analytics/morvelio?exemplo=1`.
Alterne “Ver dados reais” para conferir estados sem credenciais.
Os testes simulam APIs, paginação, CSV UTF-16, isolamento de falhas, limites e autenticação do cron;
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
