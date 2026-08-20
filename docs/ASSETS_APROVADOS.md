# Assets aprovados

## Banners finais

Existem três banners aprovados no projeto, um por jogo.

### Revalio

- Arquivo: `public/projects/revalio/revalio-banner-final.png`.
- Dimensões: 1672 × 941 px.
- Título `REVALIO` aplicado deterministicamente com a fonte local Nunito Sans.
- Conceito: uma única trilha contínua de nós sai do ponto dourado, percorre os nós concluídos e
  bloqueados e termina diretamente na porta iluminada.
- Cenário: campus médico futurista acolhedor, com laboratórios transparentes, arquitetura clínica
  curva, robótica e superfícies de diagnóstico; evitar ilhas rústicas e fantasia medieval.
- Não pode haver escada, bifurcação, loop, conector solto ou caminho atravessando personagens.
- Elenco aprovado presente: Revalio, Professor Aurélio, Aline, Rafael, Camila, Davi/Renata,
  Miguel/Beatriz, Frederico e Pomada.
- A personagem de cabelo branco preso em coque não faz parte desta composição e não deve ser
  recuperada em versões futuras.

### Docalio

- Arquivo: `public/projects/docalio/docalio-banner-final.png`.
- Dimensões: 1672 × 941 px.
- Título `DOCALIO` aplicado deterministicamente com a fonte local Kenney Blocks.
- Toda a arte segue a linguagem low-poly do jogo: câmera elevada, personagens compactos, formas
  facetadas, clínica de campanha, estações e terreno coerentes.
- O médico central preserva cabelo quadrado castanho, óculos claros redondos, bigode, uniforme
  branco/amarelo e luvas escuras.

### Gramelio

- Arquivo: `public/projects/gramelio/gramelio-banner-final.png`.
- Dimensões: 1536 × 1024 px — **a arte não é 1672 × 941 como as outras duas.** Ela chegou pronta do
  titular em 19 de agosto de 2026 (`C:\dev\gramelio\art\banner.png`), com título e lema já
  compostos, e é usada exatamente como veio. Reenquadrar para uniformizar cortaria o título ou a
  fileira de mundos.
- Conteúdo: vaca de desenho mastigando grama ao centro, fazenda ensolarada com celeiro, moinho e
  riacho, título `GRAMELIO` em placa de madeira, lema `COMA. PLANEJE. PRODUZA. REPITA!`, cartelas
  de recurso à esquerda, placa de customização à direita e cinco mundos na base.
- Assinatura `BLAJEEN LABS` aplicada em 20 de agosto de 2026 por
  `python tools/compose_project_banner.py gramelio <origem> <destino>`, a partir do master em
  `C:\dev\gramelio\art\banner.png`. **A posição é diferente das outras duas**: nos banners de
  Revalio e Docalio ela fica no canto inferior direito, e aqui esse canto tem a placa da campanha
  da ovelha. O único vão limpo é o céu do alto à esquerda, acima da montanha, e é ali que ela
  entra — 21,5% da largura, com a mesma névoa escura difusa que segura a assinatura clara sobre
  fundo claro, sem placa dura. Reprocessar é sempre a partir do master, nunca do arquivo servido.
- A arte anuncia coisas que o texto do site não repete — “5 mundos”, `EM BREVE: CAMPANHA DA
  OVELHA`. A copy de `src/content/projects.ts` descreve mundos e campanhas futuras sem número e
  sem promessa; se a arte for atualizada, a copy não precisa mudar junto.

O QA visual mede a proporção **por jogo** (`tools/qa-shots.mjs`), justamente porque elas não são
iguais. Um número único reprovaria um banner correto.

## Ícones dos jogos

Revalio e Docalio foram fornecidos pelo titular em 17 de agosto de 2026 e Gramelio em 19 de agosto
de 2026, a partir de `Icones/` na raiz do repositório.

- Revalio: `public/projects/revalio/revalio-icon-512.png`, 512 × 512 px.
- Docalio: `public/projects/docalio/docalio-icon-512.png`, 512 × 512 px.
- Gramelio: `public/projects/gramelio/gramelio-icon-512.png`, 512 × 512 px, derivado de
  `Icones/gramelio-icone-v1-1254.png` (original `C:\dev\gramelio\art\icon2.png`, 1254 × 1254).
  Das três variantes entregues, esta é a de leitura mais forte em tamanho pequeno: a vaca ocupa
  mais quadro e não há moldura branca em volta.

São os ícones de ficha do Google Play. No site eles aparecem onde a pessoa escolhe entre os
jogos — os atalhos de projeto da gaveta de navegação. Regras:

- usar sempre em proporção 1:1, sem cortar nem distorcer;
- acompanhar sempre o nome do jogo em texto; o ícone sozinho não identifica o produto;
- `alt` vazio quando o nome do jogo estiver no mesmo link, para não duplicar a leitura;
- não substituem o banner nem a assinatura Blajeen Labs em nenhuma composição;
- os arquivos originais permanecem em `Icones/`; `public/` guarda a cópia servida.

## Logo renderizada — `logo.png`

Fornecida pelo titular em 17 de agosto de 2026. Servida em `public/brand/blajeen-logo.png`
(2164 × 727, com transparência real; nenhum processamento foi necessário).

A arte já é o conceito da marca viva: os dois `E` são lentes verdes acesas e a gosma escorre da
base das letras. Uso, via `src/components/brand/BrandLogo.tsx`:

- é a logo do hero da home e o LCP da rota, então entra com prioridade e sem carregamento preguiçoso;
- o site mantém a marca viva **apagando as lentes por um instante**, no ritmo do mascote. A imagem
  nunca é alterada: as lentes são duas sobreposições circulares posicionadas em 66,40% e 78,95% da
  largura, a 37% da altura — medidas na própria arte e expressas em percentual, para acompanhar
  qualquer largura de exibição;
- as sobreposições são `aria-hidden`; o nome da marca é anunciado uma única vez, pelo `alt` da arte;
- com `prefers-reduced-motion` ou `MOVIMENTO: DESLIGADO`, as lentes ficam acesas e paradas;
- no header continua a marca tipográfica em CSS (`LiveWordmark`): em 20 px, vetor lê melhor que
  raster, e ela é o mesmo desenho de wordmark.

## Arte de fundo — `pc-lab.png`

Fornecida pelo titular em 17 de agosto de 2026. Servida em `public/brand/pc-lab.png`
(1536 × 1024, com transparência real).

Fica **atrás dos textos descritivos** para dar personalidade, via
`src/components/brand/LabBackdrop.tsx`. É a única arte que divide espaço com texto corrido, então
tem regra própria:

- opacidade 0.26 combinada com `brightness(0.5)`. Os verdes acesos da arte são o que de fato
  ameaça a leitura; escurecê-los permite manter a arte visível sem apagar o texto;
- uma máscara em gradiente apaga a arte na faixa onde a coluna de texto começa, e no mobile ela
  recua para o rodapé do bloco, onde o texto ocupa a largura toda;
- decorativa: `aria-hidden`, sem texto alternativo, sem ponteiro, e sem animação — é Server
  Component, não custa JavaScript.

**Antes de mexer na opacidade, rode `npm run qa:contraste`.** Ele apaga o texto, fotografa o que
está atrás, procura o pixel mais claro sob cada linha e calcula o contraste do pior caso. Com os
valores atuais o pior caso é 5,37:1, contra os 4,5:1 exigidos pela WCAG AA. Aumentar a opacidade
sem medir é como o texto vira ilegível.

## Frasco do laboratório — `vial.png`

Fornecido pelo titular em 17 de agosto de 2026. Servido em `public/brand/vial.png`
(1224 × 1285, com transparência real).

Acento decorativo espalhado pelos cantos das seções com texto, via
`src/components/brand/LabVial.tsx`. Segue as mesmas regras do mascote: `aria-hidden`, sem texto
alternativo, sem ponteiro, atrás do conteúdo, e parado com movimento reduzido ou desligado. Menor
que o mascote de propósito — ele pontua, não protagoniza.

## Mascote do laboratório — dinorobô

Fornecido pelo titular em 17 de agosto de 2026, em duas poses, a partir de `Icones/`:

- `blajeen-site-dinorobo-mascote-v1.png` — olhos abertos;
- `blajeen-site-dinorobo-closed-eyes-mascote-v1.png` — olhos fechados.

Os arquivos originais chegaram **opacos**, com o xadrez de transparência pintado nos pixels e em
enquadramentos diferentes. `npm run build:assets` recorta o fundo por preenchimento a partir das
bordas — uma chave de cor global comeria os brilhos do metal — e normaliza as duas poses na mesma
caixa de 801 × 900, alinhadas pelo pé. As saídas são `public/brand/dinorobo-olhos-abertos.png` e
`public/brand/dinorobo-olhos-fechados.png`. Reprocessar é sempre a partir de `Icones/`, nunca das
saídas.

Uso no site, via `src/components/brand/LabMascot.tsx`:

- alterna as duas poses no ritmo da marca viva, para parecer vivo e piscando;
- fica no canto de seções com texto, atrás do conteúdo, com opacidade baixa e leve dessaturação —
  ele pertence à paleta mineral, não é adesivo colorido sobre a composição;
- os cantos alternam entre as páginas; nos cantos direitos ele é espelhado para encarar o texto;
- é decorativo: `aria-hidden`, sem texto alternativo, sem ponteiro e sem informação exclusiva;
- estático e de olhos abertos com `prefers-reduced-motion` ou `MOTION: OFF`;
- oculto abaixo de 640 px, onde não há canto livre fora da coluna de leitura;
- nunca sobre banner, título de jogo ou assinatura Blajeen Labs.

## Assinatura Blajeen Labs

- Fonte de verdade em vetor: `public/brand/blajeen-labs-simple.svg`.
- Derivado raster para composição: `public/brand/blajeen-labs-simple.png`.
- A assinatura contém apenas `BLAJEEN` e `LABS`, sem olhos, pupilas, mascote ou símbolo inserido nas
  letras.
- Usa tipografia forte, degradê frio discreto e linhas de apoio suaves.
- Deve ser aplicada sem placa preta, com sombra difusa apenas para preservar contraste.
- Os títulos dos jogos e a assinatura são compostos por `tools/compose_project_banner.py`; não
  pedir ao gerador de imagens para recriar nenhum desses textos.

## Material de referência que NÃO vai para o site

Junto com a arte do Gramelio vieram folhas de referência visual em `C:\dev\gramelio\art`:
`mapas.png`, `loja-vestuario.png`, `splash1.png` e `splash2.png`. Elas são documentos internos de
produção — trazem anotações de desenho, tabelas de assets, valores em reais e o nome anterior do
projeto (`GRASS & MILK`). Publicá-las como galeria diria que são telas do jogo, o que não é
verdade. Ficam fora do site enquanto o bloqueador `arteGramelio` estiver aberto.

## Regras para Claude

- usar apenas os arquivos `*-banner-final.png`, um por jogo;
- não recuperar versões anteriores ou numeradas;
- preservar a proporção de cada arte — elas não são todas iguais — e não cortar títulos nem
  assinatura;
- manter a trilha do Revalio como uma única sequência até a porta;
- manter toda a cena do Docalio no estilo low-poly do jogo;
- gerar WebP/AVIF derivados durante o build, mantendo os PNGs como mestres;
- tratar as artes como key art, não como screenshots das lojas.
