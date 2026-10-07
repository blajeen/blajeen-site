# Carrelio: implementação

Pedido do titular (07/10/2026): um produto "igual o prédio 3D, porém para um carro", mostrando o
carro todo e o interior, com a **Comeri Omoda** na demonstração. A Comeri é a concessionária que
pediu carros chineses para atrair clientes (lista do contato: GAC GS3, GS4, Omoda 5, Jaecoo 5 e
Geely EX2). O titular autorizou o nome da loja na demonstração ("pode colocar no demonstrativo
porque foi eles que me pediu"). O objetivo é conquistar a loja como cliente.

## Escolhas

- **Carro: Jaecoo 5.** Lançado no Brasil em 01/10/2026, é o carro que a loja precisa vender agora.
  Também existe modelo 3D dele com interior à venda.
- **Experiência:**
  - Por fora: 3D em tempo real com acabamento de configurador. Pintura com verniz, estúdio com
    reflexos longos, troca de cor, portas, faróis e noite.
  - Por dentro: câmera no banco do motorista. No projeto real, fotos 360° do carro da loja.
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
  - Nenhum logotipo de marca é usado, e a página não diz que a Comeri usa o produto.
- **Fora dos buscadores** (`robots: noindex`) e fora da lista de produtos até o titular aprovar a
  publicação.

## O modelo 3D

- O titular compra o "2026 Jaecoo J5 with interior" (CGTrader, US$ 179). Antes de comprar, conferir:
  - licença *Royalty Free* (a *Editorial* não serve);
  - volante à esquerda;
  - versão sem "EV" no nome;
  - portas e porta-malas como peças separadas.
- O arquivo-fonte comprado **nunca** entra neste repositório, que é público, porque a licença não
  permite redistribuir. Ele vai para um repositório privado. Aqui entra só o `.glb` otimizado
  servido pela página.
- Até o modelo chegar, a demonstração usa o "Car Concept" das amostras glTF da Khronos
  (CC BY 4.0, Eric Chadwick / Darmstadt Graphics Group). O crédito aparece no palco, e a marca
  d'água diz "CARRO PROVISÓRIO". Os logotipos dele ficam escondidos.

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

## Antes de publicar

- Aprovação do titular para a página pública com o nome da Comeri e o carro da marca.
- O modelo do Jaecoo 5 no lugar do provisório, e os pôsteres refeitos.
- Política de privacidade: a seção "Preferências guardadas no seu navegador" precisa citar o
  que a demonstração do Carrelio guarda. O texto passa pela revisão do titular.
- Lista de produtos, sitemap e imagem de compartilhamento.
