# Blajeen Labs: conduto de energia

## Pedido

O titular pediu um elemento de design avançado que chamasse atenção: uma corrente de energia, um líquido verde num tubo de vidro percorrendo o site, talvez em 3D. Depois da primeira prévia, pediu a aparência mais realista. Em 29/09/2026 aprovou, pediu a publicação (a versão da home foi ao ar no PR #17) e pediu o conduto em todas as páginas. No mesmo dia, pediu que o líquido encha só uns 70% da tela e avance com a rolagem, também no computador em que ele aparecia sempre cheio (movimento reduzido). A emenda com a função narrativa e os limites está no topo de `docs/PLANO_MESTRE_DO_SITE.md`.

## O que é

Um tubo de vidro com líquido verde-ácido, desenhado em WebGL2, que desce pelas margens das páginas, atravessa a página nas faixas livres entre as seções e passa por trás das faixas com fundo próprio (como a de chamadas da home). Na home, termina encaixado no botão "Vamos criar seu projeto", e um reflexo atravessa o botão quando o líquido chega. Nas outras páginas, termina numa tampa de metal.

O líquido enche até 70% da altura da tela, nunca além, e só avança quando a página rola para baixo; no fim da página, enche inteiro. Nos trilhos, a frente fica na linha de leitura (70% da tela). Uma travessia só começa a correr de lado quando a linha chega à altura dela, e enche na proporção da rolagem ao longo de 45% de uma tela; enquanto isso, a frente fica acima da linha. Antes, a faixa de cada travessia vinha antes dela, e a frente corria à frente da linha: na primeira tela da home em 1440×900 ela parava a 92% da altura, e rolando chegava ao pé da tela.

O conduto mora no layout, dentro do `main`: um motor e um contexto WebGL para o site todo. Numa navegação dentro do site, ele mede a página nova e enche o tubo de novo, sem recriar o contexto; o canvas fica escondido do momento em que a página nova entra até o primeiro desenho dela, para o tubo da anterior não aparecer nela. Painel (`/admin`) e portal de onboarding (`/onboarding`) ficam sem tubo. As páginas legais do Gramelio (`/gramelio/privacy`, `/gramelio/support` e `/gramelio/suporte`) são HTML estático fora do layout e também ficam sem.

- Margem lateral de pelo menos 28 px (computador e, nas páginas internas, o tablet em pé): o tubo corre nas margens, com uma luva de metal em cada divisa de seção e no meio de cada travessia. O LED da luva acende quando o líquido passa. O shader desenha até 8 luvas de uma vez; o trajeto guarda todas, e a cada desenho o renderizador manda só as que caem no canvas. Antes, uma página longa perdia as luvas do fim e a tampa.
- Margem estreita, de 13 a 28 px (celular; na home, também o tablet em pé): o tubo corre encostado na borda da tela, com meio pixel de ar e raio de uns 5 px num celular de 390 px, e acompanha a leitura como no computador, desde a primeira dobra. O vidro para a 5 px da coluna de texto: é a faixa do anel de foco dos botões e links que ficam na borda dela, verde como o líquido; sobre o tubo, o anel sumiria. Antes, ali os trilhos corriam fora da tela e só apareciam as travessias, como linhas finas entre as seções; o titular disse que no celular não dava para ver o tubo. A primeira tentativa pôs o tubo no meio da margem, e o QA acusou o anel de foco sobre o vidro em 539 conferências; por isso ele foi para a borda. O halo do tubo chega atrás do começo das linhas de texto, e isso foi medido (ver Verificação): nenhuma perdeu contraste.
- Margem de menos de 13 px (o tubo mais fino, de raio 4, mais a faixa do anel de foco): os trilhos correm fora da tela e só aparecem as travessias, como canos por trás da página. Numa página sem travessia, aí o canvas some e o laço não roda. Hoje nenhuma página do site tem margem assim.

## Como a página marca o caminho

- `data-conduto-lado="esquerda|direita"` fixa o lado de uma seção (a home marca hero, configurador, trabalhos, desafio e painel final; a wiki e a página do Morvelio marcam o bloco `.mwiki` pela direita). Em 01/10/2026 o titular pediu o tubo contornando o desafio do Morvelio: o desafio passou para a esquerda, entre trabalhos e painel final pela direita, e o tubo atravessa por cima do jogo, desce ao lado dele e volta por baixo. São três lados, e não quatro, porque o tubo nunca sobe. A home passou de três para cinco travessias; `npm run qa:conduto` seguiu sem invasões nos 12 tamanhos.
- `data-conduto-lado="alternar"` pode trocar de lado em relação ao trecho anterior, mas só depois de o tubo correr pelo menos 80% de uma tela do mesmo lado, somando a altura dos trechos. O `Container` (`src/components/layout/Section.tsx`) já traz essa marca, e por isso toda página interna tem o tubo sem marcação própria. A altura de tela dessa conta é a de quando a página abriu: no celular a barra de endereço muda a altura durante a rolagem, e o tubo não pode trocar de lado por isso.
- Um trecho marcado dentro de outro não conta.
- `data-conduto-destino` no elemento onde ele termina (o botão final da home).
- Tudo o que fica entre dois trechos na ordem do documento, em qualquer nível, vira obstáculo: a travessia escolhe a primeira faixa livre que caiba o tubo, fora deles.

## Arquivos

- `src/components/conduto/trajeto.ts`: geometria pura. Monta o trajeto a partir das caixas medidas (trechos retos e curvas de 90°, nunca subindo), mede o nível do líquido pela linha de leitura, espalha cada travessia pela rolagem depois que a linha chega nela e remapeia o nível quando a página muda de tamanho (pela altura, quando o número de travessias muda).
- `src/components/conduto/renderizador.ts`: WebGL2 e o shader. Uma faixa de triângulos ao longo do trajeto; o fragment shader reconstrói o corte de um cilindro de vidro com líquido dentro.
- `src/components/conduto/motor.ts`: mede a página, posiciona o canvas dentro do documento (ele rola junto com o conteúdo pelo compositor, sem atraso), anima o nível com uma mola sem overshoot e descansa quando ninguém interage. `entre` e `medir` (a leitura das caixas) são exportadas para os testes em `motor.test.ts`.
- `src/components/conduto/Conduto.tsx` e `Conduto.module.css`: componente e camada (z-index -1 dentro do `main`); o reflexo do botão final.
- `src/lib/fila-da-gpu.ts`: coordena quem compila shader pesado (ver Desempenho).
- `src/components/motion/abertura.ts`: o teto da abertura do laboratório, compartilhado entre a abertura e o conduto.
- `src/components/home/HomeExperience.css`: o brilho do painel final passou para uma camada abaixo do tubo, e o painel passou a guardar a mesma margem das outras seções (até 1320 px ele encostava nas bordas da tela).

## Realismo

O shader imita uma foto de estúdio de um tubo de laboratório:

- Fresnel de Schlick (o vidro reflete pouco de frente e quase tudo de lado), com linhas finas de luz na silhueta e uma leve dispersão (o vermelho sai um pouco para fora e o azul para dentro).
- Reflexos de caixas de luz em platô, e não de pontos: um risco nítido da luz principal, uma contraluz rasante e um brilho macio que segue o mouse. O reflexo principal ondula de leve ao longo do tubo, como vidro de verdade.
- A parede de vidro funciona como lente e amplia o líquido. O líquido tem volume: núcleo claro, borda escura (reflexão interna total), translúcido na beirada, com veios da correnteza e um fio de luz concentrada do lado oposto ao da luz.
- Menisco côncavo com o líquido parado e esticado quando ele corre. Bolhas em anel que sobem para o alto do tubo nos trechos horizontais, e espuma na frente quando o líquido avança.
- Sombra em tinta, nunca preto chapado, com o fio de luz verde que o tubo cheio concentra no papel.
- Luvas de aço escovado com anéis de vedação e um LED.

Cores: nenhum hex no componente. Sinal no líquido e na luz que ele projeta; tinta na profundidade, na borda escura e na sombra; brilho técnico nos reflexos e no núcleo aceso do líquido; papel nos reflexos do vidro; aço no metal. Nenhuma cor passa do valor do próprio token.

## Acessibilidade e movimento

- Para leitor de tela é decorativo: `aria-hidden`, sem ponteiro, atrás do conteúdo; nenhuma informação depende dele.
- Movimento reduzido (sistema) ou botão MOVIMENTO desligado: sem animação própria. O nível salta para a linha de leitura a cada rolagem (70% da tela), sem mola, correnteza, bolhas correndo, pulso ou reflexo seguindo o mouse, e a luz fica presa à página: a mesma travessia vista de duas rolagens sai idêntica (conferido pixel a pixel). Cada travessia enche de uma vez quando a linha chega nela: na faixa das travessias, o líquido correria de lado mais rápido que a rolagem, e isso é movimento. Antes, nesse modo o tubo aparecia cheio; o titular viu isso num computador com as animações do Windows desligadas e pediu o comportamento de agora.
- Com movimento, o líquido só corre de lado enquanto a pessoa rola, na proporção da rolagem. A mola é criticamente amortecida: não passa do ponto nem balança.
- O laço de animação descansa depois de 5 s sem rolagem nem ponteiro. Até 5 s de movimento automático, o critério 2.2.2 da WCAG não exige pausa; o botão MOVIMENTO continua valendo.
- Alto contraste do Windows e impressão escondem o tubo.

## Desempenho

O motor e o shader ficam num pedaço de JavaScript à parte (28 KB, 10,9 KB comprimido), carregado na primeira folga da página. O contexto WebGL e a memória do desenho nascem nessa folga, enquanto a GPU está livre; a compilação do shader espera a fila da GPU.

A fila existe porque o Direct3D (Windows) leva cerca de 200 ms para compilar o shader do conduto. A compilação corre fora da thread principal, mas o processo da GPU atende uma coisa de cada vez, e a cena 3D do hero (three.js) espera de forma síncrona pela compilação dela: sem coordenação, o tempo de bloqueio do desktop subia de cerca de 350 ms para 964 ms. Agora a cena reserva a fila até passarem os primeiros quadros pesados dela, e o conduto compila depois.

Medidas no build de produção, Windows com Intel Iris Xe (Direct3D 11), navegador novo a cada rodada, 6 rodadas alternando com e sem o conduto (mediana):

| Perfil | Com o conduto | Sem o conduto |
|---|---|---|
| Desktop 1440×900, CPU sem limite | LCP 584 ms, TBT 1063 ms, CLS 0 | LCP 748 ms, TBT 1240 ms, CLS 0 |
| Celular 412×823, CPU 4× mais lenta | LCP 764 ms, TBT 0 ms, CLS 0 | LCP 776 ms, TBT 0 ms, CLS 0 |

As diferenças estão dentro do ruído. O TBT alto do desktop vem da cena 3D do hero, que já existia antes do conduto.

No QA com GPU real (`npm run qa:conduto`), home em 12 tamanhos, nas rodadas finais desta versão:
- início do motor de 0,3 a 1,2 ms;
- preparação até o primeiro desenho de 1,3 a 5,3 ms;
- 95% dos quadros entre 0,3 e 1,7 ms, maior quadro 2,4 ms.

Numa rodada anterior, o primeiro tamanho (1920×1080, logo depois de o servidor subir) marcou 64,9 ms de preparação; nas rodadas seguintes, no mesmo tamanho, deu 12,9, 1,8 e 1,5 ms. Fica registrado como ruído da máquina, não como custo do conduto.

A criação do contexto WebGL é uma chamada única do navegador, que custou de 6 a 74 ms. Ela tem picos de 300 a 550 ms logo depois de outro contexto ser desmontado, o que o QA faz a cada tamanho e um Chromium comum também mostra.

## Verificação

- `src/components/conduto/trajeto.test.ts` (30 testes), `src/components/conduto/motor.test.ts` (4 testes) e `src/lib/fila-da-gpu.test.ts` (6 testes). Cada verificação nova foi vista falhando numa versão com o defeito correspondente:
  - travessia ignorando obstáculos;
  - chegada pela borda errada do botão;
  - trilho encostado no conteúdo;
  - trilho colado à borda no celular;
  - travessia enchendo de uma vez;
  - remapeamento perdendo o progresso;
  - trava da fila;
  - teto da espera;
  - frente passando da linha de leitura (a faixa antes da travessia);
  - luvas cortadas em 8 numa página longa (sumia a tampa);
  - remapeamento pelo índice quando o número de travessias muda;
  - troca de lado só acima de 80%, e não com 80% exatos;
  - trecho marcado dentro de outro contando como trecho;
  - marca sem lado válido virando `direita`;
  - altura da tela do momento no lugar da de quando a página abriu;
  - trilho fora da tela no celular (o limite antigo, de 28 px), e trilho no meio da margem, com o vidro sobre a faixa do anel de foco.
- `tools/check-conduto.mjs` (`npm run qa:conduto`), sobre o build de produção. Cobre:
  - o tubo nunca passa por trás de texto, imagem, ícone, botão, link ou campo, com 5 px de folga para o anel de foco no que recebe foco; só camadas de fundo decorativas (`aria-hidden`, atrás do conteúdo) ficam de fora. Só conta o que aparece: a parte de uma caixa cortada por um ancestral (rolagem própria, overflow escondido, texto só para leitor de tela) não entra. Na home em 12 tamanhos; nas rotas do sitemap e nos formulários de projeto (fora do sitemap por serem noindex) em 1440×900, 1366×768, 768×1024 e 390×844, com a wiki por amostra (`--tamanhos-das-rotas=` troca os tamanhos das rotas; a rodada final do celular usou 390×844 e 360×640). A conferência se repete com os `details` da página abertos;
  - nenhuma rolagem lateral;
  - sem rolar, a frente do líquido fica em até 70% da tela, com e sem movimento; no fim da página, o tubo enche inteiro, também numa tela alta;
  - movimento reduzido e MOVIMENTO desligado: nada se mexe sem rolagem, a frente já está na linha de leitura logo depois de uma travessia, a travessia sai idêntica vista de duas rolagens e o botão final só carrega quando a leitura chega a ele;
  - a chegada ao botão;
  - a navegação por um link: o mesmo canvas (sem contexto novo), o trajeto da página nova, o canvas escondido ou já redesenhado no primeiro quadro e o nível recomeçando;
  - a tampa do fim numa página longa;
  - no celular, o tubo à vista na margem, com o vidro inteiro entre a borda e o texto;
  - o descanso;
  - a GPU reiniciada;
  - o salto ao fim da página, sem tubo fantasma;
  - a luva de metal com o comprimento do desenho;
  - os tempos por quadro.
  O coletor de visitas do layout responde vazio no QA: ele só aceita a origem de produção (fora dela, o navegador bloqueia o envio por CORS e o console acusa um erro que não é do site), e em produção o QA contaria visitas falsas.
  As verificações de movimento reduzido, GPU reiniciada, salto e comprimento da luva foram vistas falhando com os defeitos reintroduzidos. A da luva nasceu de um defeito real: um `mix(1e9, ...)` no shader arredondava a distância para múltiplos de 64 px, e toda luva saía com uns 64 px em vez de 20.
  As desta versão também, em três builds de prova com os defeitos de volta: frente a 92% da tela (faixa antes da travessia); tubo da home aparecendo na página nova (efeito passivo, canvas sem esconder); tampa com 5 px em vez de 20 (o renderizador mandando as 8 primeiras luvas); frente 180 px acima da linha e 13 mil pixels diferentes entre as duas vistas (movimento reduzido com a faixa); botão sem carregar numa tela alta (sem a regra do fim da página); canvas desenhando 134 vezes sem nada à vista numa página sem travessia com os trilhos fora da tela. A de mídia foi vista falhando com a regra da camada de fundo desligada: a arte do laboratório atrás das seções passou a contar como invasão.
  Uma falha antiga do QA apareceu nessa prova: a captura do Playwright sai sem canal alfa, e as leituras de pixel andavam de 4 em 4 bytes, misturando canais de pixels vizinhos. A luva medida em "15 px" era esse erro; com a leitura certa, sai com 20 px, o comprimento do desenho.
- Revisão independente em três lentes (correção e regressão; experiência e acessibilidade; consistência com as regras do projeto). Os achados procedentes foram corrigidos; os que ficaram estão em Pendências.
- `npm run qa:contraste` segue passando: nenhum texto sobre arte perdeu contraste.
- O halo do tubo (sombra e brilho, até 2,3 raios do eixo) foi medido à parte, com a GPU de verdade, pelo pixel mais claro atrás de cada linha de texto, com e sem o tubo. No computador (14 páginas, 4 tamanhos), 20 linhas ficam a essa distância do eixo, e nenhuma muda. No celular (15 páginas em 390, 360 e 430 de largura), são 1.225 linhas, porque o tubo corre perto da coluna de texto; a maior queda foi de 16,1:1 para 15,7:1, e nenhuma linha ficou abaixo do mínimo por causa do tubo.
- Uma segunda revisão independente em três lentes olhou a extensão a todas as páginas. Os achados procedentes foram corrigidos nesta versão: a frente passando da linha de leitura, a tampa sumindo em página longa, a troca de lado com a barra de endereço do celular, o tubo antigo por um quadro na navegação, o líquido correndo de lado com movimento reduzido, o canvas desenhando sem nada à vista no celular, o QA sem cobrir ícones e botões sem fundo, os blocos de código que passaram a rolar de lado sem foco de teclado, e a documentação.

## Pendências

- Lighthouse de verdade (`node tools/check-lighthouse.mjs`) não foi rodado; as medidas acima são de laboratório com Playwright.
- A partir de 1280 px, o frasco fixo do canto inferior esquerdo (o botão da gosma) fica em cima do trilho esquerdo sempre que o tubo corre pela esquerda, o que agora acontece em quase todas as páginas. O vidro aparece pelas partes transparentes do frasco, e o anel de foco verde dele fica sobre o líquido. Decisão do titular: mover o frasco ou aceitar.
- Anterior a esta mudança: `/terms` e `/revalio/terms` têm dois elementos com `id="conteudo"` (o `main` e uma seção do texto legal). Correção separada.
- `npm run qa:interacao` já falhava antes desta mudança. Os seletores do cabeçalho ("Menu") e de "Produtos" foram corrigidos no PR #22; o script ainda para na "Prévia rápida", que era da home antiga. Correção separada.
