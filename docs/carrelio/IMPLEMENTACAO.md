# Carrelio: implementação

Pedido do titular (07/10/2026): um produto "igual o prédio 3D, porém para um carro", mostrando o
carro todo e o interior, com a **Comeri Omoda** na demonstração. A Comeri é a concessionária que
pediu carros chineses para atrair clientes (lista do contato: GAC GS3, GS4, Omoda 5, Jaecoo 5 e
Geely EX2). O titular autorizou o nome da loja na demonstração ("pode colocar no demonstrativo
porque foi eles que me pediu"). O objetivo é conquistar a loja como cliente.

## Escolhas

- **Carro: Jaecoo 5.** Lançado no Brasil em 01/10/2026, é o carro que a loja precisa vender agora.
  O 3D veio do Tripo (ver abaixo).
- **Experiência:**
  - Por fora: 3D em tempo real com acabamento de configurador. Pintura com verniz, estúdio com
    reflexos longos, troca de cor, faróis e noite.
  - Portas e por dentro: a cena e a interface fazem as duas coisas quando o modelo tem as peças e
    as câmeras, e isso foi testado com o Car Concept. O Jaecoo 5 do Tripo não tem nenhuma das
    duas, então a demonstração não as mostra. No projeto real, o interior vem em fotos 360° do
    carro da loja.
  - "Na sua garagem": realidade aumentada (Quick Look no iPhone, Scene Viewer no Android).
  - Painel da loja: estoque por cor e versão, preço da loja, campanha e pedidos de test drive.
  - Holograma: para carro, só como atração de vitrine (ventilador de LED). Fica para depois,
    reaproveitando o modo do Torrelio.
- **Real e de demonstração:**
  - Reais: ficha, versões, itens de série, cores e preços de lançamento, com as fontes no
    catálogo (`src/lib/carrelio/catalogo.ts`).
  - De demonstração: estoque, preço da loja, campanha e pedidos. A página e o rodapé da
    demonstração dizem isso.
  - Os tons das cores no 3D são aproximados.
  - A página não usa logotipos da marca. O letreiro que aparece na grade é o do próprio carro,
    gerado junto com o modelo. A página não diz que a Comeri usa o produto.
- **Publicação aberta**, na lista de produtos como o Torrelio e com o nome da Comeri: decisão do
  titular em 07/10/2026.

## O modelo 3D

- O titular recusou o modelo comprado ("não vou pagar R$ 1.000 só pra um demonstrativo"). Ele
  gerou o Jaecoo 5 no **Tripo AI**, no plano grátis, que sai com licença **CC BY 4.0**. O crédito
  aparece no palco: "Modelo 3D do Jaecoo 5 gerado com Tripo AI (CC BY 4.0)".
- O original (5,1 MB, uma malha, 49,8 mil triângulos, textura 4096²) está em
  `docs/carrelio/jaecoo-5-tripo-original.glb`. Ele subiu pela `main`, na raiz, e foi movido para
  cá. O site usa `public/produtos/carrelio/modelos/jaecoo-5.glb` (2,4 MB, textura 2048²), feito
  com `node tools/carrelio-modelo.mjs <original.glb> <destino.glb>`.
- O arquivo não tem portas, interior, faróis nem pintura separados. O que a cena resolve por
  manifesto (`src/components/carrelio/3d/modelos.ts`):
  - a cor da lataria vem de uma máscara na textura (cinza neutro médio, sem rodas e cabine);
  - vidros, teto, rodas e luzes vêm por região, em metros no espaço do carro;
  - verniz acetinado e normais soldadas, para disfarçar as ondulações da malha gerada.
- Sem portas nem interior, a demonstração esconde "Portas" e "Por dentro". O interior em foto
  360° fica como entrega do projeto real.
- O "Car Concept" das amostras da Khronos (CC BY 4.0) ficou só para desenvolvimento e testes das
  portas e do interior. Ele não é publicado.
- Defeitos conhecidos do arquivo gerado:
  - o "J5" e o letreiro traseiro saem borrados;
  - os trilhos do teto vêm assados na malha, então o rack não muda nada;
  - o teto preto escurece só o painel entre os trilhos;
  - alguns brilhos assados não tingem.
- Trocar de carro: rodar o otimizador e criar o manifesto com `manifestoDeIa({...})`, medindo
  de novo a cor-base, a tolerância e as regiões. Depois, os pôsteres
  (`node tools/carrelio-poster.mjs`) e a imagem de compartilhamento (`public/og/carrelio.jpg`,
  recorte do pôster 2×).

## Código

- Domínio (`src/lib/carrelio/`): `tipos`, `catalogo`, `estado`, `persistencia`, `link` e
  `formatar`, com testes.
- Loja da demonstração (`src/components/carrelio/loja.ts`): o mesmo desenho da do Torrelio.
  Guarda em `localStorage` (`blajeen:carrelio:v1`) e acompanha outras abas.
- Interface (`src/components/carrelio/`): `DemonstracaoCarrelio`, `PalcoCarro` (pôster, carga do
  3D e pontos de toque), `BarraDoPalco`, `Garagem`, `cliente/CartaoDoCarro` e
  `painel/PainelDaLoja`.
- Cena 3D (`src/components/carrelio/3d/`): o `contrato.ts` define a fronteira. O manifesto do
  modelo (`modelos.ts`) diz onde estão pintura, teto, faróis, portas, pontos de toque e câmeras
  de dentro. Trocar de carro é trocar o `.glb` e o manifesto.
- Página: `src/app/produtos/carrelio/page.tsx`, com os textos em `src/content/carrelio.ts`.

## Publicação

- O titular aprovou as capturas e o trecho novo da Política de Privacidade em 07/10/2026 ("pode
  publicar"). O trecho fica na seção "Preferências guardadas no seu navegador" e cita o que a
  demonstração do Carrelio guarda.
- Falta testar o "Na sua garagem" num aparelho de verdade. O QA daqui roda sem GPU e não alcança
  a realidade aumentada.

## Revisão de design (07/10/2026)

Pedido do titular: "é importante ficar bom pra conquistar o cliente". O padrão é configurador de
montadora, no celular e no computador.

- **Câmera:** o raio da órbita é o da mesa (`raioDaMesa` em `3d/orbita.ts`): o menor em que o carro
  inteiro cabe em qualquer ângulo da volta, com 5% da tela de respiro de cada lado
  (`FOLGA_DA_MESA`). Antes ele era medido só no ângulo de abertura, e no celular a frente saía do
  quadro de lado. A mesa gira com o raio fixo, sem o enquadramento "respirar".
- **Palco:** quadrado no celular (o 4:5 deixava metade vazia), 16:10 no tablet, a altura da tela no
  computador. A área livre da barra (64 px) entra já na criação da cena (`OpcoesDoCarro.areaLivre`).
- **Pôsteres:** os do palco saem no formato e com a barra do palco (`palco-quadrado.webp`,
  `palco.webp` e `palco@2x.webp`). O pôster fica por cima do 3D enquanto ele carrega e se dissolve no
  primeiro quadro, que é igual; a mesa só começa a girar depois. `poster.webp` e `poster@2x.webp`
  continuam para a vitrine de Produtos e para a imagem de compartilhamento, refeita do novo
  `poster@2x.webp`.
- **Palco, controles:** legenda (DEMONSTRAÇÃO e o crédito do modelo) no alto, à esquerda. Antes do
  3D, o pé do palco é "Abrir o carro em 3D" e depois "Preparando"; a barra só aparece com o carro
  pronto. Barra: Noite, Faróis, Girar, zoom (afastar, centralizar, aproximar) e Na sua garagem. No
  celular ela cabe sem deslizar: sem ícones, com o zoom no canto de cima. A tela cheia fica no canto,
  do tablet para cima, só onde o navegador deixa (no iPhone, não existe para um elemento comum).
- **Pontos de toque:** "+" num disco de vidro, que vira "×" no verde quando abre; um anel pulsa três
  vezes quando eles aparecem (só com movimento); o balão abre para dentro do palco; a dica "Arraste
  para girar · os + mostram os itens" aparece uma vez.
- **Cartão:** a campanha fica junto do preço; os itens da versão mostram os seis que mais pesam, e o
  resto num toque; a confirmação do test drive diz o carro e recebe o foco.
- **Painel:** os pedidos de test drive vêm primeiro, com "NOVO" e a contagem na aba "Painel da loja";
  "Ver no painel da loja" leva até eles. No cartão estreito, o estoque vira duas linhas por cor
  (container query), sem transbordar no celular; alvos de 44 px no toque; a campanha em duas linhas.
- **Página:** topo mais curto, para o carro aparecer na primeira tela; os atalhos "Experimente" foram
  para a fileira das abas (acima do carro, no computador); "Quero um projeto assim" vem logo depois
  da demonstração.
