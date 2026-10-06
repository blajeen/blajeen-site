# Torrelio — implementação

Pedido do titular em 06/10/2026: uma página em Produtos para mostrar a incorporadoras e hotéis o que
o estúdio constrói, a partir de um vídeo de referência ("ON! Torre 3D"). Um prédio fictício em 3D,
com a luz acesa nas unidades vendidas e apagada nas disponíveis, o cartão da unidade com preço e
fluxo de pagamento, o espelho por pavimento, o modo obra e o modo hotel; duas abas, **Visão do
cliente** e **Painel de controle**, abertas para qualquer pessoa testar; e o apartamento em 3D como
item opcional, sobre uma planta fictícia. Depois o titular pediu também a lista do que a empresa
envia para o projeto e as formas de entrega (uma página no site da própria empresa e uma aba no
painel que ela já usa).

Decisões do titular: nome **Torrelio**; hotel como modo interativo; paisagem de litoral (mar e
morros); **Residencial Vértice, em Porto Lume**; citar o Spot Hotel e Pousada e a Pousada Dona Lia
nas vantagens de hotel, dizendo que eles não usam o 3D; o projeto real entrega entorno a partir de
mapas, planta 3D por tipologia, painel com login e importação de planilha.

## O que é

`/produtos/torrelio`, um Server Component com ilhas cliente:

| Seção | Conteúdo |
|---|---|
| Cabeçalho | Rótulo, H1, lema, resumo, aviso de fictício, "Abrir a demonstração" e "Quero um projeto assim". |
| 01 / A demonstração | Abas Visão do cliente / Painel de controle e modo Incorporadora / Hotel sobre um único palco 3D. |
| 02 / Vantagens | Para a incorporadora, para quem compra e para hotéis, com "Ver na demonstração ↑" (link profundo que funciona sem JavaScript). |
| 03 / O apartamento por dentro (opcional) | Maquete e planta da tipologia de 2 dormitórios. |
| 04 / Como o projeto é feito | Passos, o que o projeto entrega e onde ele fica (página no site da empresa, endereço próprio, stand, painel próprio ou aba no painel da empresa). |
| 05 / O que vocês enviam | A lista para começar: incorporadora e hotel. |
| 06 / O que é fictício | Lista do que é inventado, o que o Torrelio não faz e o painel sem login. |
| Chamada | "Vamos criar o seu?", sob orçamento, para `/crie-seu-projeto` com tipo e ideia preenchidos. |

Em `/produtos`, o Torrelio entra numa seção própria, **02 / Sob medida**, com a ficha "Preço: Sob
orçamento"; no menu de Produtos (computador e gaveta do celular), num grupo **Sob medida**; e no
rodapé. Ele fica fora do array `produtos`, que é o dos programas gratuitos, e `ficha()` e `chamada()`
viraram `switch` exaustivo (um tipo novo sem ficha não compila).

## Dados fictícios

Tudo está em `src/lib/torrelio/` e é puro (sem React, sem three), com testes:

- `predio.ts` — torre de 24 × 16 m sobre embasamento de 32 × 26 × 7,5 m; tipos do 2º ao 19º
  (2,88 m de piso a piso; cota do 18º = +53,58 m), coberturas duplex no 20º–21º; 480 vãos de fachada
  e o mapa de cada vão para a sua unidade (74) ou quarto (146).
- `dados.ts` — tipologias (84,90 m², 66,45 m², coberturas de 168 m²), situação de lançamento escrita
  à mão andar por andar (41 vendidas, 4 reservadas, 2 indisponíveis, 27 disponíveis: 55,4%), tabela
  de preços determinística (área × R$ 9.800/m², +1% por andar, +4% vista mar, +2% canto leste;
  coberturas a R$ 14.500/m²), condição (10% de entrada, 36 mensais, 3 reforços, 60% nas chaves,
  INCC), obra (mês 14 de 36, estrutura até o 12º, vidro até o 4º) e diárias do hotel.
- `sol.ts` — posição do sol na latitude fictícia de 20° S, em hora solar, e as horas de sol direto
  por fachada e estação.
- `entorno.ts` — a paisagem que o 3D desenha e o texto da vista: o mar aparece pelos fundos a partir
  do 12º, a torre vizinha fecha a lateral leste até o 13º, o centro aparece pela frente a partir do
  6º. Um teste confere que as categorias do hotel ("vista mar") concordam com essa conta.
- `calculos.ts`, `hotel.ts`, `estado.ts` (reducer puro com histórico), `seletores.ts`,
  `persistencia.ts`, `link.ts`, `formatar.ts`.

## Estado e persistência

- O estado de domínio fica numa loja externa (`src/components/torrelio/loja.ts`) lida com
  `useSyncExternalStore`. O servidor sempre desenha o estado-base, então a hidratação confere.
- Persistência só no navegador: chave `blajeen:torrelio:v1`, registro `{ v, base, salvoEm, estado }`
  conferido campo a campo na leitura; qualquer coisa estranha volta ao estado-base. Escrita com
  espera de 150 ms; se o armazenamento falhar, espelho em memória e aviso na página.
- Sincronia entre abas do mesmo navegador pelo evento `storage`; desfazer (20 passos) só em memória;
  restaurar com confirmação na própria página.
- As reservas iniciais do hotel são geradas no navegador, com semente fixa, a partir do dia em que a
  pessoa abre o modo hotel; o armazenamento guarda só o que ela mudou.
- O estado da interface (aba, modo, unidade, hora, câmera, vista) fica na memória da página e vai
  para a URL (`?unidade=1803&vista=sul`) com `history.replaceState`, para o link ser compartilhável.

## Acessibilidade

- Abas no padrão do APG (setas, Home e End); grupos de botões com `aria-pressed`.
- Espelho por pavimento e grades do hotel como `grid` com uma parada de Tab, setas, Home e End.
- Status sempre por forma e texto, nunca só por cor; luz quente das janelas só onde representa janela.
- O canvas é `aria-hidden`; tudo o que a torre faz o espelho, o cartão, a faixa do sol (com texto
  para leitor de tela) e a descrição da vista também fazem. Se o WebGL falhar, a página avisa e segue.
- Na vista, o foco vai para "Voltar para o prédio", e Esc volta. As mudanças feitas na página viram
  um anúncio curto numa região ao vivo.
- Movimento reduzido do sistema e o botão MOVIMENTO chegam ao 3D como `movimento: false`.
- O hotel não pede nome, e-mail, telefone nem documento (há teste).

## Celular (revisão de 06/10/2026)

Abaixo de 1024 px, o palco fica em cima, o espelho no meio e o cartão embaixo. A revisão no celular
achou três quebras de fluxo, agora corrigidas:

- **"Ver a vista" fora da tela.** O toque no cartão abria a vista no palco, uma tela acima, e nada
  parecia acontecer. Agora o palco rola até a tela quando a vista abre longe dele, ou com o topo
  sob o cabeçalho fixo (`PalcoTorre`).
- **A vista coberta.** No celular, o painel da vista cobria dois terços da paisagem. Abaixo de
  1024 px ele se divide numa barra fina em cima (Voltar e título) e nos controles embaixo, e o palco
  cresce na vista. No celular, o elevador mostra só o número da unidade; o nome acessível continua
  completo.
- **A escolha sem retorno.** Tocar numa unidade do espelho ou num quarto da grade mudava o cartão e
  a torre, ambos fora da tela. A `BarraDaEscolha` fica presa ao pé da tela enquanto nem o palco nem a
  ficha estão à vista. Ela mostra o que está escolhido; o resumo leva à ficha (ou ao editor, no
  painel) e "Maquete" leva ao palco.
- A vista ganhou o controle de hora. Quem abre a vista pela interface com a maquete à noite a vê no
  fim de tarde; ao voltar, o prédio reacende, se a hora não mudou. Um link com hora vale como veio.
- No celular, nenhum rótulo da demonstração fica abaixo de 11 px. Os botões só de símbolo e a faixa
  da escolha têm 44 px de toque.
- A fileira de controles da maquete esmaece à direita para indicar que desliza.
- "Ver por dentro" cai na planta, não no título da seção. No celular, o quadro de áreas mostra só os
  totais, porque a lista de cômodos logo acima já traz cada área.
- 3D: quando a qualidade desce no fim de uma animação (aparelho lento), a cena pede um quadro novo.
  Antes, o canvas redimensionado ficava em branco até o próximo toque.

## Computador, dia e textos (revisão de 06/10/2026)

Pedidos do titular: tirar as barras de rolagem da versão web e fazer tudo funcionar melhor, menos
texto enrolativo e mais demonstração, e a maquete abrindo de dia ("noite só quando trocar").

- **Dia por padrão.** A interface e o pôster abrem às 10h do verão, com o contorno das disponíveis.
  De dia e no fim de tarde a lâmpada sumia contra o céu refletido no vidro e o status ficava
  ilegível; agora a vidraça acesa ganha a cor da luz (âmbar na vendida, azul na reservada), em
  `materialDoVidro`, e some à medida que a noite chega, quando a própria lâmpada já diz. Os pôsteres viraram `poster-dia*.webp`, gerados pela
  cena (`tools/torrelio-poster.mjs`), e a imagem social sai do pôster de dia. A noite fica no botão,
  no atalho "Ver à noite" e no hotel ("A ocupação de cada noite").
- **Sem barra de rolagem nos painéis.** Sobre a maquete, o espelho e o cartão rolam por dentro sem
  barra, e no fim do painel a roda do mouse segue para a página. No painel de controle, a maquete
  fica presa ao lado (`position: sticky`) e o painel inteiro rola com a página.
- **O palco cabe na tela.** No computador, `--altura-palco` desconta os atalhos e a fileira das
  abas. "Abrir a demonstração" para nos atalhos, com o palco inteiro visível.
- **A maquete abre sozinha** quando o palco fica 400 ms à vista, depois de a pessoa mexer na página
  (rolar, tocar, teclar). Quem só abre a página, como uma ferramenta de medição, não carrega o 3D, e
  o pôster continua sendo o LCP. Com economia de dados ligada, só pelo botão.
- **Atalhos "Experimente"** no lugar do parágrafo de abertura: ver a vista do 18º, ver à noite,
  marcar uma venda, ver a obra, virar hotel. No celular, eles ficam numa fileira que desliza.
- **Textos.** Vantagens viraram frases curtas, cada uma com o seu "Ver na demonstração". O resto
  também ficou mais curto: abertura, apartamento, como é feito (entregas só com o título), lista
  do que vocês enviam, o que é fictício e as notas do apartamento. As regras de
  `src/content/torrelio.test.ts` continuam valendo. Palavras na página: de 2.304 para ~1.450.

## Modo holograma (06/10/2026)

Pedido do titular: "eu queria fazer um holograma desse 3D" → "faz no site". O botão **Holograma** da
demonstração (e o atalho "Ver em holograma") abre a tela inteira preta com o prédio girando numa mesa,
para equipamento de stand comprado à parte:

- **Pirâmide** (tela deitada, pirâmide de acrílico de ponta para baixo no centro): quatro vistas em
  cruz, cada uma com o "para cima" apontando para fora; quem dá a volta na pirâmide vê o prédio por
  outro lado (a câmera anda 90° por face). **Vitrine** (vidro a 45° diante da tela): uma vista.
- **Espelhar** (ligado): o reflexo inverte a imagem, e ela já sai invertida. **Girar 180°** na
  vitrine, para tela em cima do vidro. **Dia/Noite** (abre de dia, como a demonstração).
- **Gravar vídeo (1 volta)**: grava no navegador, sem enviar nada, uma volta de 24 s da vista da
  frente, sem espelho, em 1080 × 1080 (MP4 quando o navegador grava MP4; senão WebM), para o
  ventilador de LED. Com movimento reduzido, não há giro nem gravação, e "Girar 90°" mostra os lados.
- Link direto para o PC do stand: `/produtos/torrelio?holograma=piramide` (ou `vitrine`). Os
  controles somem depois de 3,5 s sem mexer; Esc fecha; o foco volta a quem abriu.
- Segue o estado da demonstração: uma venda marcada no painel (nesta janela ou em outra do mesmo
  navegador) acende no holograma. Entre aparelhos diferentes, só com servidor, no projeto.
- Código: `3d/holograma.ts` (geometria das vistas, testada sem WebGL), `3d/cena-holograma.ts` (só a
  torre e a fachada, sem céu, névoa, chão nem cidade; o reflexo do vidro também é preto; um anel
  verde marca a base) e `holograma/ModoHolograma.tsx` (diálogo com foco preso, por portal).
- Conferido no build de produção: pirâmide e vitrine, de dia e de noite, em 1600 × 900 e 390 × 844;
  o vídeo gravado é um MP4 1080 × 1080 de 23,9 s.

## Privacidade

A demonstração não envia nada a servidor e não coleta dado pessoal. A seção "Preferências guardadas
no seu navegador" da Política de Privacidade passou a citar o que ela guarda; o texto precisa da
revisão do titular (`docs/DECISOES_ANTES_DE_PUBLICAR.md`, seção Torrelio).

## 3D

- **Torre** (`src/components/torrelio/3d/`): three.js por import dinâmico, depois de um gesto na
  página e com o palco à vista (o pôster é o LCP). Noite: 24 chamadas e ~102 mil triângulos; dia com sombra: 29 e ~139 mil; vista da varanda:
  16–18 e ~120 mil; celular: 24 e ~77 mil. Chunk da cena: 36 KB gz sem o three. Tone mapping Neutral
  (o AgX deixava as janelas creme); orla com gabarito de 28 m, para o 3D esconder o mar no 11º e
  mostrá-lo do 12º para cima, como a tabela.
- **Apartamento** (`src/components/torrelio/apartamento/`): planta fictícia de 2 dormitórios com
  suíte (`src/lib/torrelio/planta.ts`: 9 cômodos, área útil 57,61 m², privativa 66,45 m²), planta
  técnica em SVG que funciona sem WebGL, maquete e planta em 3D com renderizador próprio (9 a 11
  chamadas, ~4 mil triângulos). A varanda do apartamento (1,20 m) não tem a mesma medida da varanda
  da torre (1,6 m); o canto e a orientação batem.
- **Nitidez** (pedido do titular, "nada borrado"): os dois renderizadores vão até 2× de densidade,
  com MSAA abaixo de 2×; pôsteres com versão 2× (`srcset`) e retrato para celular em até 3×.

## Verificação

- Testes unitários do domínio, da loja, dos textos (sem promessa de resultado, fictício declarado,
  lista de materiais e formas de entrega), da planta e das paredes, e da interface com uma cena 3D
  falsa (`3d/falsa.ts`): carga única do 3D, escolha pelo espelho e pela torre, venda no painel
  acendendo a luz, desfazer, restaurar, persistência, vista com foco e Esc, movimento reduzido, falha
  do WebGL e reserva sem dado pessoal. Suíte inteira: 334 testes.
- Build de produção: torre e apartamento carregam sem erro no console, sem rolagem lateral, a 1440 e
  a 390.
- Lighthouse, computador: Performance 98, Acessibilidade 100, Boas práticas 96 (o único erro é um
  script externo que o ambiente de teste bloqueia); SEO local 69 só porque o build local não é
  indexável.
- Lighthouse, celular: Performance 69. Neste ambiente, sem GPU, o tubo verde (conduto) é desenhado
  por software e gasta ~7 s em toda página: `/about` faz 45 e `/produtos/vistalio`, 47, nas mesmas
  condições. O titular pediu para tirar o conduto depois desta publicação. Sem o conduto e com a
  revisão do celular: Performance 87, Acessibilidade 100, Boas práticas 96.
- Contraste: pior caso 7,23:1. Conduto: 0 invasões em `/produtos/torrelio` e `/produtos`.

## Pendências

- ~~Tirar ou reduzir o conduto~~: removido em 06/10/2026, logo depois desta publicação.
- Opcional: casar as medidas da varanda da torre com as do apartamento.
