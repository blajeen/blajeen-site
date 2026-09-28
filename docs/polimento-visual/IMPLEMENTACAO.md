# Blajeen Labs — revisão de UI e acabamento visual

**Estado atual: publicado em https://blajeen.com.br em 26/09/2026, por autorização explícita do titular.** Deploy `dpl_3HvNQ1kmXu13PrsyE5LdGNr8fvHa`, status READY. As notas de não publicação abaixo registram as etapas anteriores. Build remoto `npx next build`, sem migrations. 123 testes passaram antes do envio. Verificação pública: sete rotas, novos ícones e inicialização WebGL aprovados; evidências em `qa/production-report.json`.

O titular autorizou uma revisão geral da aparência, incluindo imagens, reorganização e consistência entre páginas. Implementação no site `C:/dev/blajeen-labs`, branch `feat/morvelio-wiki`. Prévia: <http://127.0.0.1:3018/>. Nenhuma publicação em produção nesta etapa.

## Mudanças

### Navegação e espaço útil

- A barra lateral fixa do celular saiu da composição. Cabeçalho com marca legível e botão Menu abre a gaveta acessível já existente no projeto.
- As páginas passam a ocupar a largura inteira do telefone. Wiki, mapas, formulários e capturas ganham espaço sem diminuir os textos.
- Gaveta com bloqueio de scroll, fundo inerte, foco contido, fechamento por Escape, retorno ao botão e acesso direto à wiki.
- Navegação desktop mais compacta, marca acompanhada de wordmark e superfície contínua no cabeçalho.

### Capturas de sites e sistemas

- Reutilizado o componente `SystemScreenshot`, agora com barra discreta, bordas precisas e superfície neutra. `ScreenshotFrame` acrescenta a base editorial e acesso à imagem original quando aplicável.
- Aplicado a projetos da home, portfólio, páginas de cases, cards de SaaS, mídia dos SaaS e catálogo de produtos. As galerias de produto que já usam `SystemScreenshot` herdam o acabamento.
- Saturação 88% e brilho 97% no desktop. As cores originais retornam em hover/foco; no toque, o filtro é removido. Sem blur e sem redesenhar a interface capturada.
- Imagens inteiras com `object-contain`. Fotografias e artes de jogos permanecem fora desse tratamento.
- Cases têm link “Abrir captura completa” para consulta em tamanho original.

### Hierarquia e consistência

- Largura editorial máxima de 110rem para 90rem (1.440 px), evitando linhas e grades excessivamente espalhadas em telas grandes.
- Texto secundário mais claro, painéis com raio consistente e foco de formulário mais perceptível.
- Título do portfólio encurtado para aproximar os trabalhos da primeira dobra.
- Mascote ambiental mais discreto no desktop e oculto no mobile para não competir com texto e navegação.
- Interações pequenas nos projetos e links, respeitando movimento reduzido.

### Rodapé

- Marca, descrição e chamada para iniciar um projeto com hierarquia mais clara.
- Grupos de links expansíveis no celular e visíveis em colunas no desktop.
- Links legais, exclusão de dados, suporte e produtos preservados. Sem JavaScript, todos os grupos permanecem abertos para acesso direto.

## Validação

- 122 testes em 18 arquivos passaram.
- TypeScript, lint e build de produção passaram.
- 14 rotas verificadas em 390 e 1440 px: home, trabalhos, case Dom Guima, sistemas, Lojalio, produtos, Clearlio, Morvelio, wiki, contato, briefing, estúdio, novidades e privacidade.
- Nessas 28 combinações: HTTP 200, um `main`, um `h1`, imagens da primeira dobra carregadas e ausência de overflow horizontal.
- Menu testado por abertura, navegação, Tab, Escape, retorno de foco e bloqueio do fundo. Rodapé Legal testado no celular. Link para captura original retorna 200.
- Cabeçalho também conferido no limite desktop de 1280 px.
- Evidências: `qa/report.json`, 28 capturas e relatório Lighthouse mobile (`qa/lighthouse-mobile.json`). Os screenshots são de navegador, não testes em aparelhos físicos.

## Arquivos centrais

- `src/app/polish.css`: acabamento compartilhado, capturas, header e footer.
- `src/app/globals.css`: tokens de largura, contraste, raio e retirada da margem mobile.
- `src/components/media/SystemScreenshot.tsx`: moldura de captura reaproveitada.
- `src/components/projects/ScreenshotFrame.tsx`: base editorial e imagem original.
- `src/components/navigation/SiteHeader.tsx` e `NavDrawer.tsx`: navegação mobile e marca.
- `src/components/layout/FooterGroup.tsx` e `SiteFooter.tsx`: grupos de rodapé responsivos.
- `tools/qa-visual-polish.mjs`: matriz de páginas e fluxos.

## Limites e publicação

As modificações tratam da apresentação. Preços, alegações comerciais, políticas, aplicativos e conteúdos da wiki não foram alterados por esta revisão. O portão de publicação e o bloqueio de indexação da prévia continuam ativos. Não houve commit, push ou deploy.

### Lighthouse mobile

Desempenho 93, acessibilidade 100 e boas práticas 100. SEO 69 porque a prévia mantém o bloqueio intencional de indexação. Medição local em navegador com emulação mobile.

## Acabamento da cena 3D

Revisão solicitada após a primeira aprovação visual: geometria com cantos arredondados, ambiente de reflexos gerado localmente, iluminação mais contida, sombras VSM, plataforma sem grid, pedestais escuros e detalhes do mascote. Câmeras recompostas para as três estações. Poster regenerado da cena real; carregamento sob demanda no celular preservado.

Build, TypeScript e lint aprovados. `tools/qa-3d-polish.mjs` verificou inicialização WebGL, seleção das estações e ativação mobile, sem erros de página. Capturas `qa/3d-after.png`, `qa/3d-02.png`, `qa/3d-03.png` e `qa/3d-mobile.png`. Validação em navegador; não equivale a medição em aparelho físico. Prévia atualizada em http://127.0.0.1:3018/. Sem publicação.

## Segunda revisão da vitrine 3D

Pedido do titular: mais detalhes e acabamento na própria modelagem. A grande base circular foi substituída por uma bancada baixa com bordas metálicas, pés e pedestais escuros. O enquadramento inicial aproxima os objetos e as estações de produto/mundos usam câmeras de inspeção.

- Mascote: módulos ópticos, parafusos, tampa superior, ventilação, placas laterais, juntas, garras e apoio dos pés.
- Produto: teclado com teclas individuais, mouse, moldura e câmera do monitor, interface e detalhes do telefone.
- Mundos: fundação, escadaria, arco de entrada, porta, fiadas de pedra, colares dos telhados, vegetação, rochas e marcações no aro do portal.
- Materiais físicos com acabamento de superfície, metal, borracha e pedra diferenciados.
- Rotação horizontal por arraste com limite angular; trocar de estação restaura o ângulo. Botões de estação continuam disponíveis por teclado. Movimento reduzido respeitado, inclusive na manipulação direta.
- Sombras calculadas inicialmente e atualizadas ao girar a bancada; os pequenos movimentos de cabeça/Orbe usam a sombra da pose inicial para reduzir o custo. Sem modelos remotos ou dependências novas.

Build/TypeScript e lint aprovados. As capturas de `qa/3d-*` são atualizadas pelo teste de navegador, que também verifica seleção de estações, arraste e ativação mobile. O carregamento mobile continua sob demanda. Nenhum deploy.

## Desafio do dragão — 15 segundos

O guardião foi substituído pelo Dragão do Bastião, com asas, cauda, chifres, garras, barra de vida e baforada verde direcional. Pátio com muralhas, brasões, braseiros, hera, pedras rachadas e selo central. Canvas em resolução dupla para maior nitidez.

Dificuldade autorizada: 15 segundos, seis golpes necessários, alcance de ataque de 72 unidades, recarga de 0,5 s. O dragão fixa a direção em 0,8 s e dispara em 1,55 s; ciclo de 2,3 s. Dano único por baforada, com margem correspondente ao corpo do aventureiro. Ataques bloqueados durante pausa. A vitória ainda exige coletar o fragmento e chegar ao refúgio.

Seis testes de combate aprovados, build e TypeScript aprovados. `tools/qa-dragon-challenge.mjs` completou combate/coleta/vitória pelos controles reais em navegador. `qa/dragon-breath-fixture.png` é uma captura isolada do renderer real, congelado durante o ataque; não representa uma partida completa. Sem deploy.

Conferência final: uma partida completa também passou no domínio público (15 s, pausa, seis golpes, coleta e retorno ao portal). O primeiro ensaio em paralelo com o teste WebGL perdeu a janela de combate; a repetição isolada passou sem mudanças no código publicado.

## Cavaleiro e nome da estação

Cavaleiro redesenhado em vetor: elmo fechado com viseira e penacho, capa azul, ombreiras, peitoral, cinto, botas, escudo com emblema e espada com guarda e movimento durante o ataque. A estação 3D agora se chama “Jogos interativos”. Partida completa validada em navegador; aparência conferida na captura do renderer. Atualização de produção em andamento na Vercel: `5RfaF8QopSonZxMcaiMYy93gvxiJ`.

Publicação concluída: `dpl_5RfaF8QopSonZxMcaiMYy93gvxiJ`, READY e domínio atualizado. Build/TypeScript e lint passaram.

## Prévia conectada ao painel de operação

O configurador ganhou nome de marca editável, levado à prévia e ao briefing, e duas visões: Site do cliente e Painel da operação. Simular um pedido/reserva cria um registro local com itens, valor, modalidade/horário e etapas avançáveis. Os indicadores são calculados apenas sobre os registros simulados nesta sessão, separados por tipo de negócio. Últimos 20 registros; sem persistência, pagamento, envio ou clientes fictícios apresentados como reais.

Validações: TypeScript e lint; `tools/qa-operation-preview.mjs` conferiu marca, criação de pedido, bloqueio de envio duplicado, avanço das três etapas, separação entre negócios, reserva com horário e ausência de overflow mobile. Capturas: `qa/operation-desktop.png` e `qa/operation-mobile.png`.

Publicado: `dpl_8ytSkJUGM2r8tySnwmWKgSL9j3sW`, READY. O mesmo fluxo de teste passou no domínio https://blajeen.com.br após a publicação, incluindo reserva e mobile. Build remoto aprovado, sem migrations.

## Mostruário ampliado de gestão

Adicionados seis módulos ilustrativos ao painel: editor completo do site, tráfego, métricas/funil, catálogo ou agenda conforme o negócio, equipe/atendimento e marca/SEO/integrações. Título “Seu site. Você no controle.”. Editor, gráfico sem valores e funil estão identificados como possibilidades; não coletam dados ou representam resultados reais. Fluxo demonstrativo existente segue funcional. TypeScript e teste de operação/mobile aprovados.

Publicado e validado no domínio: `dpl_AxQ8grokb7eK9wpXZ1bDmMYhNXge`. Build e lint aprovados. Teste público confirmou os seis módulos, operações e layout mobile.

## Site do cliente ampliado

Carrossel manual com três destaques por negócio (sem autoplay), seção ilustrativa de avaliações Google com identificação explícita de conteúdo fictício, contato WhatsApp com prévia local da mensagem, perguntas frequentes expansíveis e rodapé da marca. Nenhum número ou avaliação real foi inventado; sem chamada ao Google/WhatsApp ou envio de mensagem. Visual acompanha a identidade selecionada.

TypeScript aprovado; teste `qa-client-extras.mjs` cobriu navegação do carrossel, prévia/fechamento do contato, FAQ e ausência de overflow em 390 px. Capturas em `qa/client-extras-*`.

Publicação concluída: `dpl_DYTWFcxXXpF4mxybGpvV7eWqZNUB`. Build/TypeScript e lint aprovados. Teste dos novos controles e mobile passou também no domínio público.
