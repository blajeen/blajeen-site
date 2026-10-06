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

## Privacidade

A demonstração não envia nada a servidor e não coleta dado pessoal. A seção "Preferências guardadas
no seu navegador" da Política de Privacidade passou a citar o que ela guarda; o texto precisa da
revisão do titular (`docs/DECISOES_ANTES_DE_PUBLICAR.md`, seção Torrelio).

## Verificação

- Testes unitários do domínio, da loja, dos textos (sem promessa de resultado, fictício declarado,
  lista de materiais e formas de entrega) e da interface com uma cena 3D falsa (`3d/falsa.ts`): carga
  única do 3D, escolha pelo espelho e pela torre, venda no painel acendendo a luz, desfazer,
  restaurar, persistência, vista com foco e Esc, movimento reduzido, falha do WebGL e reserva sem
  dado pessoal.
- Conduto: 0 invasões em `/produtos/torrelio` e `/produtos`, a 390 e a 1440.

## Pendências

- Cena 3D da torre e pôsteres (em construção), apartamento 3D (em construção).
- Prancha da torre para o titular aprovar antes do polimento.
- Lighthouse nos dois perfis, contraste e capturas com o 3D.
