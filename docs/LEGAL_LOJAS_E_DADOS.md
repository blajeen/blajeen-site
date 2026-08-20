# Requisitos legais, dados e lojas — Blajeen Labs, Revalio, Docalio e Gramelio

Estado de referência: 16 de agosto de 2026. Este material é um rascunho operacional baseado em
documentação oficial e no código atual do Revalio. Não substitui revisão jurídica nem a conferência
dos consoles no dia do envio.

## 1. URLs públicas definitivas

Usar um domínio HTTPS estável e manter cada URL ativa durante toda a distribuição dos apps:

```text
https://[DOMINIO]/privacy
https://[DOMINIO]/terms
https://[DOMINIO]/support
https://[DOMINIO]/revalio/privacy
https://[DOMINIO]/revalio/terms
https://[DOMINIO]/revalio/support
https://[DOMINIO]/revalio/delete-account
https://[DOMINIO]/docalio/privacy
https://[DOMINIO]/docalio/terms
https://[DOMINIO]/docalio/support
https://[DOMINIO]/docalio/delete-account
https://[DOMINIO]/gramelio/privacy
https://[DOMINIO]/gramelio/terms
https://[DOMINIO]/gramelio/support
https://[DOMINIO]/gramelio/delete-account
```

As páginas devem funcionar sem login, JavaScript, cookie de consentimento ou redirecionamento para
o app. Política, suporte e exclusão de cada jogo precisam citar claramente o nome do produto e o
nome público do desenvolvedor.

## 2. O que Apple e Google exigem hoje

### Apple App Store

- URL de Política de Privacidade para todos os apps;
- respostas completas de App Privacy, incluindo SDKs e parceiros;
- Support URL com forma real de contato;
- descrição, screenshots, classificação etária, direitos de conteúdo e informações para revisão;
- exclusão iniciada dentro do app quando o app permite criar conta;
- revogação do token se `Sign in with Apple` vier a ser usado;
- declaração de dispositivo médico quando o enquadramento/categoria/região exigir;
- cautela reforçada com alegações médicas e lembrete para buscar orientação profissional antes de
  decisões reais de saúde.

### Google Play

- Política de Privacidade inclusive para apps que declarem não coletar dados;
- formulário Data safety em cada pacote publicado fora de teste exclusivamente interno;
- respostas de exclusão de dados;
- se há criação de conta: caminho no app **e** link web público para pedir exclusão;
- declaração de aplicativos de saúde para todo app publicado; Revalio e Docalio provavelmente se
  enquadram em `Medical Reference and Education`, a confirmar pelo build e posicionamento final;
- acesso ao app, classificação indicativa, público-alvo, publicidade, conteúdo e permissões;
- metadados da ficha: nome até 30 caracteres, descrição breve até 80 e completa até 4.000.

## 3. Contrato de dados — Revalio

Fonte técnica atual: `C:\dev\revalio` e seus documentos de publicação.

### Estado auditado

- funciona local-first e sem conta;
- a conta opcional usa e-mail/link mágico via Supabase;
- com conta configurada, sincroniza identificador, data e marcos limitados de progresso, XP,
  sequência, recompensas, inventário, banners e cosméticos;
- enunciados, alternativas marcadas, respostas abertas, fila de revisão, nome preferido e
  desempenho detalhado por especialidade permanecem locais;
- notificações são locais e opcionais;
- não há SDK de publicidade identificado;
- `purchases_flutter`/RevenueCat existe, mas a oferta comercial precisa ser auditada no build de
  lançamento;
- armazenamento local usa preferências do sistema e não deve ser chamado de criptografado;
- exclusão no app já possui caminhos distintos para apagar conta/nuvem preservando o progresso
  local ou apagar tudo;
- a função de banco `delete_my_revalio_data` remove eventos sincronizados e usuário autenticado.

### Declaração preliminar de dados

| Tipo | Coleta/uso provável | Finalidade | Ação antes da loja |
|---|---|---|---|
| E-mail | somente conta opcional | autenticação e suporte | confirmar Supabase de produção |
| User ID | somente conta opcional | conta e sincronização | declarar Apple/Google |
| Atividade no app | marcos limitados | sincronização da jornada | auditar payload final |
| Compras | somente se habilitadas | reconhecer assinatura | auditar RevenueCat/loja |
| Dados médicos pessoais | não coletados | não aplicável | testar ausência de campos livres |
| Localização/câmera/microfone/contatos | não identificados | não aplicável | auditar manifests finais |
| Publicidade/rastreamento | não identificado | não aplicável | auditar SDKs e rede |

### Política de privacidade — texto-base do Revalio

#### Identificação

O Revalio é disponibilizado por **[NOME CIVIL OU RAZÃO SOCIAL]**, **[CPF/CNPJ]**, com endereço em
**[ENDEREÇO LEGAL]**, doravante “Revalio” ou “Controlador”. Contato de privacidade:
**[E-MAIL CONFIRMADO]**.

#### Finalidade

O Revalio é uma experiência educacional de microaprendizagem voltada à preparação médica. Não
presta atendimento, não realiza diagnóstico, não prescreve tratamento e não substitui formação,
supervisão profissional ou protocolos oficiais.

#### Dados no aparelho

Sem conta conectada, a jornada funciona localmente. O aparelho pode guardar nome preferido,
aparência, preferências, trilhas, níveis, respostas, revisões, desempenho, metas, XP, recompensas,
coleção, histórico educacional e lembretes locais. O armazenamento atual usa recursos de
preferências do sistema e não deve ser descrito como banco criptografado.

#### Conta e nuvem

A conta é opcional. Quando usada, o serviço pode tratar e-mail, identificador técnico, dados de
autenticação e marcos limitados de progresso e coleção necessários à sincronização. O desenho
atual não envia prontuários, dados reais de pacientes, diagnóstico pessoal, texto de respostas ou
desempenho clínico detalhado por especialidade.

#### Prestadores

Conforme o build publicado, Supabase pode processar autenticação e sincronização; Apple e Google
processam distribuição e eventuais compras; RevenueCat pode processar produto, transação e estado
da assinatura quando compras forem ativadas. A lista deve ser atualizada após auditoria do ambiente
de produção.

#### Exclusão e direitos

A pessoa pode exportar seus dados e apagar a conta dentro do app. A página pública de exclusão
oferece alternativa sem acesso ao aplicativo. Pedidos serão concluídos em **[PRAZO]**, ressalvadas
confirmação de identidade e retenções legalmente permitidas. Excluir conta não cancela assinatura
administrada pela loja.

#### Contato e atualização

Pedidos de acesso, correção, informação, oposição, portabilidade ou eliminação podem ser enviados a
**[E-MAIL]**. Última atualização: **[DATA]**. Controlador e encarregado/canal LGPD:
**[PREENCHER]**.

O texto completo canônico já existente no projeto Revalio deve ser reconciliado com este resumo
antes da publicação: `C:\dev\revalio\docs\publicacao\RASCUNHO_POLITICA_DE_PRIVACIDADE.md`.

### Página de exclusão — Revalio

**Título:** Excluir sua conta do Revalio

Você pode apagar sua conta dentro do aplicativo: **Menu → Sobre e privacidade → Apagar somente
minha conta**. Essa opção remove conta, e-mail de autenticação e cópia sincronizada, preservando o
progresso que existe apenas no aparelho.

Para apagar também os dados locais, use **Apagar todos os meus dados**. Dados presentes apenas no
aparelho não podem ser removidos remotamente.

Sem acesso ao app, envie uma solicitação para **[E-MAIL DE SUPORTE]** com o assunto **Exclusão de
conta Revalio**, usando o e-mail cadastrado. Poderemos confirmar sua identidade para proteger a
conta. O pedido será concluído em **[PRAZO]**. Dados sujeitos a obrigação legal poderão ser
conservados pelo período aplicável.

Excluir a conta não cancela uma assinatura da App Store ou do Google Play; o cancelamento deve ser
feito diretamente na loja.

## 4. Contrato de dados — Docalio

Docalio ainda não possui implementação auditável neste workspace. Para que seus textos possam ser
usados como base, a arquitetura do jogo deverá obedecer aos seguintes requisitos de produto:

- jogar localmente sem conta sempre que tecnicamente possível;
- conta opcional por e-mail ou provedor aprovado;
- sincronizar apenas progresso, inventário, decisões ficcionais e estado do jogo necessários;
- proibir entrada e envio de nome, prontuário, imagem ou qualquer dado de paciente real;
- não usar dados de saúde do dispositivo, HealthKit ou Health Connect na versão inicial;
- não solicitar localização, contatos, câmera ou microfone sem função futura documentada;
- sem anúncios comportamentais ou venda de dados;
- compras digitais somente pelos mecanismos das lojas;
- exclusão de conta e dados no app e por URL pública;
- casos, personagens e resultados declarados como ficcionais/educacionais;
- nenhuma mecânica deve alegar diagnóstico, prescrição ou recomendação clínica para a vida real.

Se o código divergir desses requisitos, a política e os formulários devem mudar antes do envio.

### Política de privacidade — texto-base do Docalio

#### Identificação e finalidade

Docalio é disponibilizado por **[NOME CIVIL OU RAZÃO SOCIAL]**, **[CPF/CNPJ]**, com endereço em
**[ENDEREÇO LEGAL]**. Contato: **[E-MAIL]**. Docalio é um jogo de simulação e aprendizagem com
situações e personagens ficcionais. Não oferece diagnóstico, tratamento ou orientação para casos
reais.

#### Dados tratados

O jogo pode armazenar localmente preferências, progresso, escolhas narrativas, inventário e estado
da simulação. Se a pessoa optar por criar conta, poderão ser tratados e-mail, identificador de
usuário, dados de autenticação e os elementos de progresso necessários para sincronização.

Docalio não deve solicitar dados reais de pacientes. Não insira nomes, prontuários, imagens,
resultados de exames ou outras informações pessoais ou clínicas reais no jogo ou no suporte.

#### Prestadores e compras

**[LISTAR APÓS AUDITORIA: autenticação, banco, crash reporting, hospedagem, Apple, Google e serviço
de compras]** podem processar somente os dados necessários às suas funções. Compras digitais, se
existirem, serão processadas pela App Store ou pelo Google Play; Docalio não receberá o número
completo do cartão.

#### Retenção, direitos e exclusão

Dados da conta serão mantidos enquanto ela estiver ativa e pelo tempo necessário às finalidades
informadas. A pessoa poderá acessar o caminho **Configurações → Conta e privacidade → Excluir
conta**, ou usar esta página pública. A conclusão ocorrerá em **[PRAZO]**, ressalvadas retenções
legais. Solicitações de acesso, correção e eliminação: **[E-MAIL]**.

Última atualização: **[DATA]**. Controlador/canal LGPD: **[PREENCHER]**.

### Página de exclusão — Docalio

**Título:** Excluir sua conta do Docalio

No jogo, abra **Configurações → Conta e privacidade → Excluir conta**. Confirme a ação para remover
a conta e os dados sincronizados associados.

Sem acesso ao jogo, envie um e-mail para **[E-MAIL]** com o assunto **Exclusão de conta Docalio**,
usando o endereço da conta. Poderemos solicitar confirmação de identidade. Serão apagados o
identificador, o e-mail de autenticação, o progresso sincronizado e demais dados vinculados que não
precisem ser mantidos por obrigação legal. Dados somente locais devem ser removidos no aparelho.

Prazo: **[PRAZO]**. Excluir a conta não cancela assinatura da loja.

## 4-A. Contrato de dados — Gramelio

Acrescentado em 19 de agosto de 2026. O Gramelio está mais cedo que o Docalio: em
`C:\dev\gramelio` existe apenas arte, sem código, build ou backend a auditar. Nada pode ser
declarado como comportamento; o que existe são requisitos de produto fixados antes da
implementação:

- jogar sem conta e sem cadastro sempre que tecnicamente possível;
- conta opcional, nunca obrigatória para jogar;
- sincronizar apenas progresso, cosméticos e estado do jogo, se houver sincronização;
- não solicitar localização, contatos, câmera, microfone ou identificadores de publicidade sem
  função documentada;
- sem anúncios comportamentais e sem venda de dados;
- compras digitais, se existirem, somente pelos mecanismos das lojas;
- exclusão de conta e dados no app e por URL pública.

Duas questões são próprias deste jogo e não aparecem nos outros dois:

1. **Público infantil.** Um jogo de fazenda com arte fofa tende a atrair crianças. Se o público-alvo
   declarado incluir menores, valem o programa de Famílias do Google Play e as regras de apps para
   crianças da Apple — o que muda anúncios, SDKs permitidos, análise de dados, classificação
   etária e o próprio formulário de envio. Definir o público **antes** de escrever a ficha.
2. **Assets de terceiros.** As folhas de referência do projeto citam a biblioteca Kenney. Confirmar
   a licença de cada asset efetivamente embarcado antes de distribuir, e registrar a origem.

A loja de cosméticos descrita pelo titular é desenho de jogo. Enquanto não houver implementação
auditada, nenhuma política ou termo pode descrever moeda virtual, preço, pacote ou compra como
existentes.

## 5. Termos comuns aos produtos

Cada jogo deve ter termos próprios, mas todos devem conter:

- identificação do titular;
- finalidade educacional e/ou de entretenimento;
- ausência de diagnóstico, prescrição, atendimento e garantia acadêmica — nos produtos médicos;
- proibição de inserir dados reais de pacientes — nos produtos médicos;
- regras de conta e segurança do e-mail;
- propriedade intelectual e direitos de terceiros;
- regras de compra, renovação, restauração, cancelamento e reembolso quando houver monetização;
- condutas proibidas, disponibilidade, encerramento e contato;
- lei aplicável e cláusula de resolução validadas juridicamente.

Texto-base de aviso curto para Revalio e Docalio:

> Este produto tem finalidade educacional e de entretenimento. Não substitui formação,
> supervisão profissional, protocolos oficiais, avaliação clínica nem decisão médica. Não use
> casos do jogo para diagnosticar ou tratar pessoas reais.

O Gramelio não é produto médico e não usa este aviso. O risco dele é outro — parecer um aplicativo
já distribuído —, e o aviso correspondente está em `src/content/projects.ts`.

## 6. Metadados propostos — Revalio

### Apple App Store

- **Nome:** Revalio
- **Subtítulo:** Microaprendizagem médica
- **Categoria principal:** Educação
- **Categoria secundária:** Medicina, após confirmação do enquadramento
- **Texto promocional:** Estude para as fases objetiva e prática do Revalida em doses curtas, com
  revisão, progresso por especialidade e uma jornada que cabe na rotina.
- **Copyright:** `2026 [TITULAR CONFIRMADO]`

### Google Play

- **Nome:** Revalio
- **Descrição breve:** Microaprendizagem para as fases objetiva e prática do Revalida.
- **Descrição completa:** usar a versão auditada em
  `C:\dev\revalio\docs\FICHA_GOOGLE_PLAY.md` e atualizar a lista conforme o build enviado.

### Assets e narrativa

1. trilha e especialidade;
2. atividade com feedback;
3. revisão e compreensão do erro;
4. progresso/recompensa;
5. personalização ou Revalio TV, somente se presentes no build.

Sem promessa de aprovação, vínculo oficial, número não auditado ou dado pessoal real.

## 7. Metadados propostos — Docalio

Estes textos são de pré-produção e só podem ir às lojas depois de corresponderem ao build.

### Apple App Store

- **Nome:** Docalio
- **Subtítulo:** Medical RPG & simulation
- **Categoria principal:** Games
- **Subcategorias propostas:** Role Playing e Simulation
- **Texto promocional:** Entre em um mundo de casos ficcionais, escolhas e evolução, onde cada
  paciente muda a história.
- **Copyright:** `2026 [TITULAR CONFIRMADO]`

### Google Play

- **Nome:** Docalio
- **Descrição breve:** Um RPG médico de escolhas, casos ficcionais e evolução contínua.
- **Descrição completa preliminar:**

Docalio é um RPG de simulação médica em desenvolvimento, criado para transformar aprendizagem em
aventura.

Enfrente situações clínicas ficcionais, tome decisões, acompanhe consequências e desenvolva sua
jornada em um mundo construído para continuar apresentando novos desafios.

O foco está na experiência de jogo: progressão, narrativa e aprendizado fazem parte do mesmo
sistema. Docalio não é um serviço de saúde, não fornece diagnóstico ou prescrição para casos reais e
não substitui formação, supervisão profissional ou protocolos oficiais.

Recursos e plataformas serão descritos quando estiverem implementados no build público.

### Assets e narrativa

1. mundo/personagem e identidade do jogo;
2. caso ficcional e decisão;
3. consequência narrativa;
4. progressão;
5. variedade visual do mundo.

Capturas devem vir do jogo real. Concept art deve ser claramente identificada no site e não usada
como screenshot de loja.

## 8. Checklist único de submissão por app

- [ ] titular, nome público, e-mail, endereço e domínio confirmados;
- [ ] política e termos revisados e publicados;
- [ ] página de suporte com contato real;
- [ ] exclusão dentro do app testada ponta a ponta;
- [ ] página web de exclusão pública testada;
- [ ] inventário de SDKs, permissões e endpoints do build final;
- [ ] tráfego de rede observado em instalação limpa, com e sem conta;
- [ ] Apple App Privacy preenchido conforme o build;
- [ ] Google Data safety preenchido conforme o build;
- [ ] Google Health apps declaration preenchida — quando o app tratar de saúde;
- [ ] público-alvo definido e regras de aplicativos para famílias avaliadas, se houver público
      infantil;
- [ ] classificação etária/IARC respondida pelo conteúdo real;
- [ ] direitos de conteúdo e licenças documentados;
- [ ] screenshots reais sem dados pessoais;
- [ ] suporte e notas de revisão preparados;
- [ ] compras, restauração, cancelamento e RevenueCat auditados se habilitados;
- [ ] política revisada novamente depois de qualquer SDK novo.

## 9. Fontes oficiais verificadas

- Apple — [App Privacy](https://developer.apple.com/help/app-store-connect/reference/app-privacy/)
- Apple — [propriedades obrigatórias do App Store Connect](https://developer.apple.com/help/app-store-connect/reference/app-information/required-localizable-and-editable-properties)
- Apple — [informações da versão e Support URL](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)
- Apple — [exclusão de conta](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- Apple — [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Google — [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- Google — [exclusão de conta](https://support.google.com/googleplay/android-developer/answer/13327111)
- Google — [Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291)
- Google — [conteúdo necessário para revisão](https://support.google.com/googleplay/android-developer/answer/9859455)
- Google — [limites da ficha](https://support.google.com/googleplay/android-developer/answer/9859152?hl=pt-BR)
- Google — [recursos gráficos](https://support.google.com/googleplay/android-developer/answer/9866151?hl=pt-BR)

