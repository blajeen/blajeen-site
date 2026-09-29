# Blajeen Labs: conduto de energia

## Pedido

O titular pediu um elemento de design avançado que chamasse atenção: uma corrente de energia, um líquido verde num tubo de vidro percorrendo o site, talvez em 3D. Depois da primeira prévia, pediu a aparência mais realista. A emenda com a função narrativa e os limites está no topo de `docs/PLANO_MESTRE_DO_SITE.md`. Até a aprovação do titular, isto é prévia: nada foi publicado.

## O que é

Um tubo de vidro com líquido verde-ácido, desenhado em WebGL2, que desce pelas margens da home, atravessa a página nas faixas livres entre as seções, passa por trás da faixa de chamadas e termina encaixado no botão "Vamos criar seu projeto". O líquido enche conforme a leitura avança; quando chega ao fim, um reflexo atravessa o botão uma vez.

- Desktop e telas com margem de pelo menos 28 px: o tubo corre nas margens, com uma luva de metal em cada divisa de seção e no meio de cada travessia. O LED da luva acende quando o líquido passa.
- Celular e tablet em pé: um tubo fino colado à borda pareceria barra de rolagem e ficaria na área do gesto de voltar. Ali os trilhos verticais correm fora da tela e só aparecem as travessias e a chegada ao botão, como canos que passam por trás da página. Consequência: no celular o tubo não aparece na primeira dobra, só a partir do fim do hero.

## Como a página marca o caminho

- `data-conduto-lado="esquerda|direita"` em cada seção por onde o tubo passa (hero, configurador, trabalhos, desafio e painel final).
- `data-conduto-destino` no elemento onde ele termina (o botão final).
- Blocos sem marcação entre duas seções marcadas viram obstáculos: a travessia escolhe a primeira faixa livre que caiba o tubo, fora deles.

## Arquivos

- `src/components/conduto/trajeto.ts`: geometria pura. Monta o trajeto a partir das caixas medidas (trechos retos e curvas de 90°, nunca subindo), mede o nível do líquido pela linha de leitura, espalha cada travessia pela rolagem e remapeia o nível quando a página muda de tamanho.
- `src/components/conduto/renderizador.ts`: WebGL2 e o shader. Uma faixa de triângulos ao longo do trajeto; o fragment shader reconstrói o corte de um cilindro de vidro com líquido dentro.
- `src/components/conduto/motor.ts`: mede a página, posiciona o canvas dentro do documento (ele rola junto com o conteúdo pelo compositor, sem atraso), anima o nível com uma mola sem overshoot e descansa quando ninguém interage.
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
- Movimento reduzido (sistema) ou botão MOVIMENTO desligado: o tubo aparece cheio e parado, sem pulso, com a luz presa à página. Rolar não muda o desenho (conferido pixel a pixel).
- O líquido só corre de lado enquanto a pessoa rola, na proporção da rolagem. A mola é criticamente amortecida: não passa do ponto nem balança.
- O laço de animação descansa depois de 5 s sem rolagem nem ponteiro. Até 5 s de movimento automático, o critério 2.2.2 da WCAG não exige pausa; o botão MOVIMENTO continua valendo.
- Alto contraste do Windows e impressão escondem o tubo.

## Desempenho

O motor e o shader ficam num pedaço de JavaScript à parte (26 KB, 10,5 KB comprimido), carregado na primeira folga da página. O contexto WebGL e a memória do desenho nascem nessa folga, enquanto a GPU está livre; a compilação do shader espera a fila da GPU.

A fila existe porque o Direct3D (Windows) leva cerca de 200 ms para compilar o shader do conduto. A compilação corre fora da thread principal, mas o processo da GPU atende uma coisa de cada vez, e a cena 3D do hero (three.js) espera de forma síncrona pela compilação dela: sem coordenação, o tempo de bloqueio do desktop subia de cerca de 350 ms para 964 ms. Agora a cena reserva a fila até passarem os primeiros quadros pesados dela, e o conduto compila depois.

Medidas no build de produção, Windows com Intel Iris Xe (Direct3D 11), navegador novo a cada rodada, 6 rodadas alternando com e sem o conduto (mediana):

| Perfil | Com o conduto | Sem o conduto |
|---|---|---|
| Desktop 1440×900, CPU sem limite | LCP 584 ms, TBT 1063 ms, CLS 0 | LCP 748 ms, TBT 1240 ms, CLS 0 |
| Celular 412×823, CPU 4× mais lenta | LCP 764 ms, TBT 0 ms, CLS 0 | LCP 776 ms, TBT 0 ms, CLS 0 |

As diferenças estão dentro do ruído. O TBT alto do desktop vem da cena 3D do hero, que já existia antes do conduto.

No QA com GPU real (`npm run qa:conduto`), em 12 tamanhos, duas rodadas:
- início do motor de 0,5 a 2 ms;
- preparação até o primeiro desenho de 1 a 4,4 ms;
- 95% dos quadros entre 0,4 e 2,8 ms, maior quadro 3 ms.

A criação do contexto WebGL é uma chamada única do navegador, que custou de 12 a 65 ms. Ela tem picos de 300 a 550 ms logo depois de outro contexto ser desmontado, o que o QA faz a cada tamanho e um Chromium comum também mostra.

## Verificação

- `src/components/conduto/trajeto.test.ts` (21 testes) e `src/lib/fila-da-gpu.test.ts` (6 testes). Cada verificação nova foi vista falhando numa versão com o defeito correspondente:
  - travessia ignorando obstáculos;
  - chegada pela borda errada do botão;
  - trilho encostado no conteúdo;
  - trilho colado à borda no celular;
  - travessia enchendo de uma vez;
  - remapeamento perdendo o progresso;
  - trava da fila;
  - teto da espera.
- `tools/check-conduto.mjs` (`npm run qa:conduto`), sobre o build de produção. Cobre:
  - o tubo nunca encosta em texto, imagem, botão, link ou campo, em 12 tamanhos;
  - nenhuma rolagem lateral;
  - movimento reduzido e MOVIMENTO desligado deixam o tubo cheio e idêntico ao rolar;
  - a chegada ao botão;
  - o descanso;
  - a GPU reiniciada;
  - o salto ao fim da página, sem tubo fantasma;
  - a luva de metal com o comprimento do desenho;
  - os tempos por quadro.
  As verificações de movimento reduzido, GPU reiniciada, salto e comprimento da luva foram vistas falhando com os defeitos reintroduzidos. A da luva nasceu de um defeito real: um `mix(1e9, ...)` no shader arredondava a distância para múltiplos de 64 px, e toda luva saía com uns 64 px em vez de 20.
- Revisão independente em três lentes (correção e regressão; experiência e acessibilidade; consistência com as regras do projeto). Os achados procedentes foram corrigidos; os que ficaram estão em Pendências.
- `npm run qa:contraste` segue passando: nenhum texto sobre arte perdeu contraste.

## Pendências

- Lighthouse de verdade (`node tools/check-lighthouse.mjs`) não foi rodado; as medidas acima são de laboratório com Playwright.
- A partir de 1280 px, o frasco fixo do canto inferior esquerdo fica em cima do trilho esquerdo quando o configurador está na tela. Decisão do titular: mover o frasco ou aceitar.
- Por enquanto o conduto está só na home. Levar para as outras páginas exige marcar as seções de cada uma e passar pelo mesmo QA.
- `npm run qa:interacao` já falhava antes desta mudança: os seletores dele não batem com o cabeçalho ("Menu") e com o botão "Produtos que funcionam" do hero. Correção separada.
