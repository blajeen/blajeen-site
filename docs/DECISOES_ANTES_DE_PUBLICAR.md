# Decisões humanas e bloqueadores

O projeto está pronto para execução técnica, mas estes dados não podem ser inferidos por Claude.
Nenhuma página jurídica deve ir ao ar com colchetes ou informação inventada.

## Identidade e infraestrutura

- [ ] confirmar se o titular será pessoa física ou jurídica;
- [ ] informar nome civil/razão social e CPF/CNPJ aplicável;
- [ ] informar endereço legal publicável;
- [ ] confirmar nome público do desenvolvedor nas duas lojas;
- [x] domínio público ativo — `blajeen.com.br`, com HTTPS e deploy verificados em 20/08/2026 e
      gravado em `src/content/site.ts`;
- [x] criar e confirmar e-mails de marca, suporte e privacidade — confirmados pelo titular em
      17/08/2026: estúdio `brg.ftw@gmail.com`, Revalio `contato.revalio@gmail.com`,
      Docalio `contato.docalio@gmail.com`. Falta apenas testar o recebimento em cada caixa;
- [ ] decidir se haverá versão em inglês completa no lançamento;
- [ ] revisar disponibilidade de marca/domínio e eventual registro no INPI.

## Privacidade e jurídico

- [ ] definir prazo operacional para exclusão e pedidos de titulares;
- [ ] definir retenção de logs e backups por fornecedor;
- [ ] confirmar canal/encarregado LGPD aplicável;
- [ ] aprovar Política de Privacidade da Blajeen Labs;
- [ ] aprovar Política e Termos do Revalio;
- [ ] aprovar Política e Termos do Docalio quando existir build;
- [ ] revisar direitos de provas, gabaritos, imagens, áudios, fontes e conteúdo de terceiros;
- [ ] obter revisão jurídica antes de publicação.

## Revalio

- [ ] comparar este pacote com `C:\dev\revalio\docs\publicacao`;
- [ ] confirmar ambiente Supabase de produção e executar teste real de exclusão;
- [ ] decidir se conta/sincronização entram no primeiro build;
- [ ] decidir se RevenueCat/compras ficam desabilitados no primeiro build;
- [ ] confirmar regiões, público adulto e categorias das lojas;
- [ ] fechar App Privacy, Data safety e Health apps declaration a partir do build final;
- [ ] produzir screenshots reais e notas de revisão.

## Docalio

- [ ] criar especificação técnica e repositório do jogo;
- [ ] confirmar plataformas e modelo de negócio;
- [ ] confirmar se haverá conta, nuvem, compras, IA ou telemetria;
- [ ] implementar exclusão dentro do jogo antes de habilitar criação de conta;
- [ ] auditar dados e substituir todas as seções condicionais da política;
- [ ] confirmar categoria, classificação e conteúdo médico do build;
- [ ] só então converter os metadados preliminares em ficha de loja.

## Gramelio

Entrou no site em 19 de agosto de 2026, a partir da descrição do titular e da arte em
`C:\dev\gramelio\art`. É o produto mais cedo dos três: existe arte e desenho, não existe código.

- [x] confirmar o e-mail do jogo — `contato.gramelio@gmail.com`, confirmado pelo titular em
      20/08/2026 e publicado nas quatro páginas do produto. Falta testar o recebimento na caixa,
      como nas outras duas;
- [ ] criar especificação técnica e repositório do jogo;
- [ ] confirmar plataformas e modelo de negócio;
- [ ] decidir se haverá conta, nuvem, compras ou telemetria — a loja de cosméticos aparece no
      desenho, e se ela virar compra real muda política, termos e as declarações das duas lojas;
- [ ] definir o público-alvo. Um jogo de fazenda com desenho fofo atrai público infantil, e isso
      aciona as regras de aplicativos para famílias do Google Play e do App Store — anúncios,
      análise de dados, classificação e conteúdo mudam de exigência;
- [ ] confirmar a licença dos assets de terceiros usados no protótipo (as folhas de referência
      citam a biblioteca Kenney) antes de qualquer distribuição;
- [ ] implementar exclusão dentro do jogo antes de habilitar criação de conta;
- [ ] fornecer capturas reais quando existir build, para a galeria de `/projects/gramelio`.

## Site

- [ ] fornecer logos/arte final de Revalio e Docalio;
- [ ] selecionar screenshots reais do Revalio;
- [ ] fornecer somente concept art autorizada do Docalio;
- [x] aplicar a assinatura Blajeen Labs sobre a arte do Gramelio — composta em 20/08/2026 por
      `tools/compose_project_banner.py`, no céu do alto à esquerda, único vão limpo da arte;
- [x] substituir `hello@blajeenlabs.com` do protótipo se o endereço não existir — removido do site
      implementado; o endereço institucional segue pendente e aparece como “Em definição”;
- [x] escolher hospedagem — **Vercel**, projeto `blajeen-labs`, primeiro deploy em 17/08/2026.
      `/privacy` já nomeia o provedor e descreve os dados de conexão;
- [ ] confirmar retenção dos registros de acesso no plano contratado e o acordo de tratamento de
      dados da Vercel, para fechar o prazo em `/privacy`;
- [ ] decidir se haverá analytics; recomendação inicial: não;
- [ ] executar QA e publicar as URLs legais antes de preencher os consoles.

---

# URGENTE — o Revalio foi publicado com a política incompleta

Registrado em 18 de agosto de 2026, quando o titular informou que o Revalio já está na App Store e
no Google Play.

A consequência é direta: `/revalio/privacy`, `/revalio/terms` e `/revalio/delete-account` deixaram
de ser preparação. São os documentos de um aplicativo **em distribuição**, lidos por usuários
reais e informados aos consoles das lojas — e continuam se declarando "versão de trabalho", sem
nomear o controlador e sem prazo de exclusão.

O site segue dizendo a verdade sobre esse estado, por decisão do titular. Mas o prazo mudou de
natureza: estas cinco pendências deixaram de ser preparação e viraram dívida de um produto no ar.

1. `titularNome`, `titularDocumento`, `titularEndereco` — a LGPD exige identificar o controlador
   na política de um app que já trata dados de pessoas;
2. `prazoExclusao` — a página de exclusão de conta está pública sem prazo declarado;
3. `canalLgpd` — canal de titulares;
4. `revisaoJuridica` — enquanto aberta, os documentos permanecem rotulados como versão de trabalho;
5. `lojasRevalio` — as URLs das fichas, para o site poder apontar para as lojas.

Também confirmar, agora que há build publicado: se o pacote enviado corresponde ao comportamento
descrito na política (conta opcional por link mágico, sincronização limitada, compras desativadas)
ou se algo mudou entre a auditoria de 12/08/2026 e a versão publicada.

---

# Como o site implementado trata cada bloqueador

Atualizado em 16 de agosto de 2026, junto com a implementação em Next.js.

A fonte de verdade em código é `src/content/blockers.ts`. Cada item ali é um campo que **não**
pode ser inferido. Nenhum deles é preenchido com valor plausível: a interface renderiza um bloco
`Em definição` que nomeia o que falta e por quê (`src/components/legal/PendingNotice.tsx`).

Verificação:

```powershell
npm run check:content                    # lista os bloqueadores em aberto
$env:SITE_PUBLICACAO="1"; npm run check:content   # falha enquanto houver bloqueador aberto
```

## Bloqueadores em aberto e onde eles aparecem

| Id em `blockers.ts` | O que falta | Onde o site mostra “Em definição” |
|---|---|---|
| `titularNome` | pessoa física ou jurídica, e o nome/razão social publicável | `/privacy`, `/revalio/privacy`, `/revalio/terms`, `/docalio/privacy`, `/docalio/terms` |
| `titularDocumento` | CPF ou CNPJ correspondente | depende de `titularNome`; some com ele |
| `titularEndereco` | endereço legal publicável | idem |
| `canalLgpd` | encarregado ou canal de titulares | `/privacy`, `/revalio/privacy` |
| `prazoExclusao` | prazo operacional para concluir pedidos | `/revalio/privacy`, `/revalio/delete-account` |
| `revisaoJuridica` | revisão jurídica dos textos | `/terms`, `/revalio/privacy`; mantém todo documento como “versão de trabalho” |
| `foroJuridico` | lei aplicável e resolução de conflitos | `/terms`, `/revalio/terms`, `/docalio/terms` |
| `hospedagemLogs` | retenção dos registros de acesso e acordo de dados da Vercel | `/privacy` |
| `onboardingRetencao` | retenção das respostas, arquivos, revisões e auditoria depois da entrega | `/privacy` |
| `contaDocalio` | se o Docalio terá conta, nuvem, compras ou telemetria | `/docalio/privacy`, `/docalio/terms`, `/docalio/delete-account` |
| `screenshotsRevalio` | capturas reais aprovadas | a galeria de `/projects/revalio` não é renderizada |
| `conceptArtDocalio` | concept art autorizada | a galeria de `/projects/docalio` não é renderizada |
| `lojasRevalio` | URLs das fichas na App Store e no Google Play | os selos de loja de `/projects/revalio` ficam sem link |
| `escopoGramelio` | se o Gramelio terá conta, nuvem, compras ou telemetria | `/gramelio/privacy`, `/gramelio/terms`, `/gramelio/delete-account` |
| `arteGramelio` | capturas reais ou concept art autorizada | a galeria de `/projects/gramelio` não é renderizada |

## Decisões que a implementação tomou, e que precisam de confirmação

1. **Canais de contato — resolvido em 17/08/2026.** São três, um por escopo, e o site nunca mistura
   um com outro:

   | Escopo | Endereço | Onde aparece |
   |---|---|---|
   | Estúdio | `brg.ftw@gmail.com` | `/contact`, `/support`, `/privacy` |
   | Revalio | `contato.revalio@gmail.com` | `/revalio/*`, `/support` |
   | Docalio | `contato.docalio@gmail.com` | `/docalio/*`, `/support` |
   | Gramelio | `contato.gramelio@gmail.com` | `/gramelio/*`, `/support` |

   O endereço do Revalio também consta do build e dos documentos de publicação do app
   (`C:\dev\revalio\docs\publicacao\INVENTARIO_RELEASE.md`), então site e aplicativo continuam
   coerentes. Um teste verifica que nenhuma página de produto exibe o canal de outro produto.

   - [ ] enviar uma mensagem de teste para as quatro caixas e confirmar o recebimento antes de
         informá-las nas fichas das lojas — Apple e Google verificam o endereço declarado.

2. **Plataformas.** Nenhuma loja é anunciada para nenhum dos jogos ainda não publicados.
   `INVENTARIO_RELEASE.md` registra que o pacote de produção do Revalio ainda não foi gerado e que
   o iOS depende de macOS/Xcode. As gavetas e páginas exibem “Ainda não anunciadas”.

3. **Estado do Docalio.** A auditoria de 16/08/2026 em `C:\dev\docalio` mostra um protótipo
   jogável bem mais avançado do que “em concepção”: oito plantões, Shop, personalização e save
   local versionado (`docs/00-HANDOFF.md`). Ao mesmo tempo, `docs/10-UI-UX-CONTA-LIGAS.md`
   confirma que **não existe conta, nuvem, placar nem backend**, e o site foi escrito sobre esse
   fato. Duas consequências para decisão humana:
   - a página `/docalio/delete-account` afirma que hoje não há conta a excluir, porque descrever
     um caminho de menu inexistente seria instrução falsa;
   - se o titular quiser comunicar o avanço do protótipo, é preciso aprovar explicitamente quais
     recursos podem ser citados. Hoje `src/content/projects.ts` mantém `recursos: []` para o
     Docalio, conforme o limite editorial de `COPY_FINAL_DO_SITE.md`.

4. **Recursos do Revalio.** O site cita cinco blocos — trilhas, atividades, revisão, progressão e
   ritmo — todos presentes em `C:\dev\revalio\docs\FICHA_GOOGLE_PLAY.md`. Sala Vermelha, Sprint e
   Revalio TV existem no build, mas ficaram de fora por não estarem na copy aprovada. Incluí-los é
   decisão editorial, não técnica.

5. **Data dos documentos.** Os documentos de Blajeen Labs, Revalio e Docalio exibem “16 de agosto
   de 2026” como data desta versão de trabalho, e os do Gramelio “19 de agosto de 2026”, quando
   foram escritos. Todos ficam no estado “Versão de trabalho pública”: a data de aprovação só
   existe depois da revisão jurídica.

6. **Estado do Gramelio.** O titular descreveu o jogo — toque único, campanha da vaca, estômago,
   volta ao curral, mapas pequenos, mundos, missões, estrelas, conquistas, customização e loja de
   cosméticos — e isso é o **desenho**, não o comportamento de um build. Como `C:\dev\gramelio` só
   tem arte, o site separou os dois em campos diferentes: `recursos` continua vazio (a página o
   rotula “o que existe no build hoje”) e o desenho vive em `pilares`, sob o rótulo “no desenho”,
   com uma nota dizendo que nada ali está pronto. Um teste impede que produto sem build publicado
   preencha `recursos`.
   - [ ] quando existir build, mover para `recursos` só o que estiver implementado e auditado.

## Sequência recomendada para publicar

1. decidir titularidade e registrar nome, documento e endereço;
2. testar o recebimento nas três caixas de e-mail já confirmadas;
3. definir prazos de retenção e de resposta a titulares;
4. escolher hospedagem e declarar os logs de acesso em `/privacy`;
5. obter revisão jurídica dos seis documentos;
6. remover de `src/content/blockers.ts` cada item resolvido e preencher o valor com `definido(...)`,
   registrando a fonte da confirmação;
7. rodar `SITE_PUBLICACAO=1 npm run check:content` — ele precisa passar;
8. rodar `npm run verify` e o QA visual;
9. só então preencher App Store Connect e Google Play Console com as URLs publicadas.

