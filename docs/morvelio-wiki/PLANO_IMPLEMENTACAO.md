# Morvelio Wiki — plano de implementação

**Destino:** Blajeen Labs · **Endereço proposto:** `https://blajeen.com.br/morvelio/wiki`  
**Estado:** plano para implementação; nenhuma página foi publicada neste trabalho.  
**Base editorial:** documentos vigentes da pasta **Morvelio - Documentação**, na Área de Trabalho, incluindo as revisões de 27/09/2026.  
**Projeto do site:** `C:/dev/blajeen-labs`.

## 1. Decisão de produto

Criar uma área exclusiva de consulta chamada **Morvelio Wiki**, dentro do domínio e da identidade do Blajeen Labs. Ela terá banco de conteúdo navegável, busca, filtros, fichas individuais, relações entre registros, atlas e guias. A referência de experiência é o [Wowhead](https://www.wowhead.com/): encontrar uma informação e seguir suas conexões. Layout, textos, imagens, nomes e dados serão próprios de Morvelio.

A página `/projects/morvelio` continua sendo a apresentação do jogo. A wiki ocupa `/morvelio/wiki`, com navegação própria e retorno claro ao estúdio. O leitor deve entender onde está sem perder o contexto do jogo.

**Resultado esperado:** alguém procura um broche, entende seu efeito, descobre como obtê-lo, abre a missão necessária e encontra o personagem ou lugar relacionado. Outro leitor explora os cinco reinos e compreende quais pertencem à campanha mobile e quais pertencem à saga.

### Prioridades

1. Dados corretos e conectados, com fonte e estado de implementação.
2. Consulta rápida no celular: busca, filtros úteis, números legíveis e links diretos.
3. Identidade visual de Morvelio, com arte toon e mapas existentes.
4. Cobertura dos documentos autorizados, acompanhada por inventário de lacunas.
5. Atualização sustentável: mudar uma receita uma vez e refletir a alteração em todas as páginas relacionadas.

## 2. O que foi conferido

O site usa **Next.js App Router, React, TypeScript e Tailwind**, com conteúdo local tipado, testes Vitest e ferramentas Playwright. A página atual de Morvelio usa o componente genérico `ProjectPage`. O ícone cadastrado é a versão da montanha sem nome. O site mantém Morvelio como protótipo em desenvolvimento, sem URL de loja cadastrada.

| Fonte na Área de Trabalho | Extensão conferida | Uso na wiki |
|---|---:|---|
| 01 · Plantas e Assets | 208 páginas | Ambientes, conexões, dungeons, acampamento, casa e portais; adaptar plantas técnicas para consulta |
| 02 · Elenco e Combate | 53 páginas | Classes, habilidades, personagens, monstros e chefes |
| 03 · Questline | 72 páginas | Missões, objetivos, requisitos, recompensas e encadeamento |
| 04 · Mundo e Lore | 28 páginas | Erdávia, reinos, famílias, lugares e cronologia |
| 05 · Itens, Equipamento e Economia | 22 páginas | Armas, nove broches, moedas, receitas e casa |
| 06 · Regras e Sistemas | 16 páginas | Controles, combate, progressão, modos e guias |
| 07 · Roteiro e Falas | 24 páginas | Diálogos e cenas, com proteção de spoilers |
| 08 · Guia de Arte | 15 páginas | Paletas, silhuetas, identidade toon e uso coerente das imagens |
| Direção atual · documentos 01–13 | Markdown/HTML | Correções e decisões posteriores aos volumes; precedência editorial |
| Atlas dos cinco reinos | Cartas e notas | Mapa mundial e mapas de Velidor, Caldria, Sahram, Durnagal e Orissel |
| Divulgação · Nova identidade - Orbe | PNGs e manifestos | Ícone atual com MORVELIO, capa e artes promocionais |

As capas documentam **93 missões**: 63 principais, 19 opcionais, sete diárias e quatro semanais. O volume de plantas anuncia **39 ambientes e 118 plantas**; isso descreve o material de produção, não 39 mapas comprovadamente disponíveis ao jogador. Não converter essas contagens em promessa comercial.

Os hashes das fontes lidas ficam em `FONTES_DESKTOP.json`. Os PDFs permanecem preservados. A wiki será alimentada por registros revisados, sem depender de ler PDFs no navegador ou acessar a Área de Trabalho em produção.

## 3. Arquitetura de informação e endereços

| Endereço | Finalidade |
|---|---|
| `/projects/morvelio` | Apresentação do jogo, novo ícone, capturas e entrada da wiki |
| `/morvelio/wiki` | Portal: busca, categorias, guias iniciais, atlas e novidades da documentação |
| `/morvelio/wiki/busca?q=broche` | Resultados gerais, com grupos e filtros |
| `/morvelio/wiki/classes` | Sete classes; arma, estilo e habilidades |
| `/morvelio/wiki/classes/cavaleiro` | Ficha de classe e conteúdo relacionado |
| `/morvelio/wiki/habilidades/[slug]` | Ataque, especial, passiva ou talento com fonte e condições |
| `/morvelio/wiki/itens` | Armas, broches, materiais, moedas e decoração documentada |
| `/morvelio/wiki/itens/broche-da-guarda` | Efeito, obtenção, requisitos e relações |
| `/morvelio/wiki/receitas/[slug]` | Ingredientes, quantidades, custo e responsável pela forja |
| `/morvelio/wiki/personagens/[slug]` | NPCs, serviços, aparições e missões |
| `/morvelio/wiki/criaturas/[slug]` | Monstros e chefes: ataques, encontros e recompensas comprovadas |
| `/morvelio/wiki/missoes/[slug]` | Objetivos, sequência, lugares e recompensas |
| `/morvelio/wiki/regioes/[slug]` | Lugares da campanha, mapas e pontos de interesse |
| `/morvelio/wiki/dungeons/[slug]` | Caverna, Factory e Castelo; salas, requisitos e encontros |
| `/morvelio/wiki/mundo` | Erdávia, atlas geral, continentes e cinco reinos |
| `/morvelio/wiki/reinos/[slug]` | Um reino, sua casa real, geografia e participação na saga |
| `/morvelio/wiki/guias/[slug]` | Começar, combate, forja, casa e progressão |
| `/morvelio/wiki/cronicas/[slug]` | História, famílias, eras e desfechos sob aviso de spoiler |
| `/morvelio/wiki/atualizacoes` | Mudanças editoriais e de dados, sem confundir com patch do jogo |
| `/morvelio/wiki/sobre` | Como usar, origem dos dados, versões e correções |

Cada categoria com fichas também terá sua página de listagem. Slugs são legíveis e estáveis; IDs internos não aparecem como título. Renomear uma ficha preserva redirecionamento do endereço antigo. Slugs inexistentes retornam 404 real.

**Entradas de navegação:** botão “Explorar a wiki” no topo da página do jogo; atalho na prévia de Morvelio; submenu do jogo no menu do estúdio; link no rodapé. Não substituir nenhuma URL existente de suporte, termos, privacidade ou exclusão.

## 4. Experiência visual

### Portal da wiki

Uma abertura compacta com o ícone novo, **MORVELIO WIKI**, descrição curta e campo de busca dominante. Abaixo, atalhos para Classes, Itens, Missões, Criaturas, Dungeons e Mundo; um bloco editorial para começar; uma prévia do atlas; últimas alterações reais.

Não obrigar o visitante a atravessar um banner grande antes de pesquisar. As ilustrações aparecem onde ajudam a reconhecer conteúdo. Contadores, quando usados, vêm dos registros publicados e nunca de metas de produção.

### Ficha no desktop

```text
Blajeen Labs                         Morvelio / Wiki / Busca
Início > Itens > Broches > Broche da Guarda

Navegação        Ícone + nome + estado              Nesta página
da wiki          Resumo / atributos                 Efeito
                 Efeito e condições                 Obtenção
                 Onde obter                         Requisitos
                 Requisitos e missões               Relacionados
                 Tabelas relacionadas
                 Fontes, edição e alterações
```

Em telas largas, navegação de aproximadamente 220–240 px, corpo flexível e sumário opcional de 180–220 px, dentro do limite do site. Em tablet, retirar a terceira coluna. No celular, busca e botão “Categorias” ficam próximos do título; filtros abrem um painel acessível; sumário vira controle recolhível. Evitar barras fixas empilhadas consumindo a tela.

### Identidade e leitura

- Herdar fundo escuro, tipografia local, foco e linguagem visual do Blajeen Labs.
- Usar dourado para acentos de Morvelio, marfim para leitura e ilustrações toon. Violeta sinaliza Orbe/corrupção, nunca aura de broche do aventureiro.
- Fichas usam tabelas compactas, divisores e hierarquia editorial. Reservar imagens maiores para mapas, personagens e lugares.
- Raridade e estado recebem texto/ícone além da cor. Não inventar uma escala de raridades para preencher a interface.
- A prévia de item funciona por foco/clique e toque, além de hover; sempre existe link normal para a ficha.
- Imagens incluem legenda que distingue captura de jogo, ilustração e planta proposta.

## 5. Modelo das fichas

| Tipo | Informações essenciais | Relações |
|---|---|---|
| Classe | Nome, arma, função, estilo, ataques, habilidades, progressão documentada | Habilidades, armas compatíveis, guias |
| Habilidade | Tipo, efeito, condições, alcance, recarga, duração e valores conhecidos | Classe, talento, estados aplicados |
| Item | Tipo, raridade se definida, efeito, restrição e obtenção | Receita, vendedor, missão, criatura |
| Receita | Resultado, ingredientes, quantidades, custos e desbloqueio | Itens, forjador, missão |
| Personagem | Papel, localização por etapa, serviços e história breve | Missões, receitas, região, crônicas |
| Criatura/chefe | Família, aparições, ataques, perigos e estratégia sustentada pelos dados | Dungeon, região, missão, recompensas |
| Missão | Tipo, pré-requisitos, objetivos, entrega e recompensas | Anterior/próxima, NPC, região, portão |
| Região | Identidade, acessos, mapa, pontos de interesse e perigos | NPCs, missões, criaturas, dungeons |
| Dungeon | Requisito de entrada, sequência, salas, chefes, saída/refúgio | Missões, encontros, recompensas |
| Reino | Raça predominante, casa real, continente, lugares e contexto | Atlas, personagens e cronologia |
| Guia | Objetivo, pré-requisitos, etapas e limites de versão | Fichas usadas em cada etapa |

**Valores ausentes:** exibir “Não documentado” quando a informação fizer falta; omitir campos irrelevantes. Distinguir ausência de valor zero e “não se aplica”. Não transformar uma chance de drop desconhecida em 100%, nem usar nível recomendado como requisito obrigatório.

**Variações:** estatísticas que dependem de nível, dificuldade ou etapa ficam associadas ao contexto. Uma ficha de chefe pode ter múltiplos encontros; não escolher silenciosamente um número universal.

### Exemplo de consulta: Broche da Guarda

- Tipo: broche; direção aprovada para o mobile.
- Efeito documentado: −12% de dano recebido; aura azul-aço.
- Obtenção prevista: loja após J13. Nome e local do vendedor dependem da confirmação da fonte; não assumir Bento como vendedor de todos os broches.
- Relações: missão J13, guia de equipamento e outras opções de broche.
- Não atribuir receita à peça se o catálogo não a documentar. Bento entra diretamente nas fichas de Platina e Sagrado.

## 6. Regras canônicas obrigatórias

1. **Aventureiros são classes:** Cavaleiro, Bárbaro, Ladina, Maga, Patrulheira, Druida e Engenheiro. O jogador escolhe o nome. Nomes literários e IDs legados não viram nomes obrigatórios da seleção.
2. **Dois espaços de equipamento:** Arma e Broche. Arma muda a aparência; broche produz aura discreta, com treino sem aura. Não restaurar catálogo de armaduras.
3. **Origem não concede poder racial:** Velidor, Caldria e Sahram humanos; Durnagal anão; Orissel elfo. As mesmas sete classes existem nas origens definidas; a implementação visual deve ser identificada conforme a versão.
4. **Cinco reinos não equivalem a cinco reinos jogáveis no mobile.** Velidor e a campanha atual têm seu escopo; Erdávia e a saga abrangem mais eras e territórios.
5. **Casa no acampamento:** começa vazia; compras com ouro fazem os móveis aparecerem em posições estabelecidas. Não anunciar editor livre de decoração.
6. **Gemas e moedas são conceitos diferentes:** gemas elementais naturais, gemas premium, Fragmentos de Luz e Fragmentos de Sombra não compartilham a mesma definição.
7. **Ônix ativo de sombra/vazio:** reservado ao Orbe e portadores corrompidos segundo a direção atual. Não listar arma heroica de ônix como oferta.
8. **Receitas futuras:** preservar o escopo de 30 Sombra já documentado para rubi/safira; não espalhar esse preço automaticamente pelas demais gemas. Sagrada elemental: 100 Sombra + 10 Luz no total, em expansão planejada.
9. **Portais:** usar a identidade autorizada de cada acesso/refúgio nas ilustrações disponíveis. Território revelado não significa passagem liberada; requisitos vêm das missões.
10. **Crônicas:** distinguir o desfecho da campanha mobile das mortes, sucessões e conquistas posteriores. Orissel permanece separado dos quatro reinos continentais conquistados na saga.

## 7. Versão, implementação e spoilers

Cada registro precisa de três dimensões independentes:

| Dimensão | Exemplos | Para que serve |
|---|---|---|
| Escopo | Mobile, livro, expansão futura | Evita misturar produto e saga |
| Evidência | Verificado em versão identificada; documentado; planejado; histórico | Evita apresentar plano como recurso disponível |
| Spoiler | Nenhum; campanha; desfecho; saga posterior | Controla a revelação de história |

Uma regra aprovada pode ainda estar pendente de implementação. A wiki mostra isso com linguagem simples. A data de edição de um documento não é uma versão de build. Se não houver build identificado, não exibir selo “confirmado no jogo atual”.

**Padrão:** busca geral, portal, sugestões, relacionados e prévias sem desfechos. O visitante habilita spoilers conscientemente para a camada escolhida. Títulos públicos e imagens sociais de páginas sensíveis usam formulação neutra.

Não basta esconder um parágrafo com CSS: o índice público de busca, os snippets, os metadados e os dados enviados à página inicial também precisam ser livres de revelações. O conteúdo sensível é carregado apenas depois de uma ação explícita; respostas e caches devem respeitar o escopo. A preferência não exige conta.

## 8. Busca, filtros e comparação

### Busca global

- Consultar nome, aliases, termos de efeito e códigos de missão, normalizando acentos: “platina”, “broche”, “J13”, “Bento”, “cavaleiro” e “gelo”.
- Ranking: nome exato, prefixo de nome, alias, termos e resumo. Dar prioridade ao conteúdo vigente no escopo selecionado.
- Resultados mostram nome, tipo, resumo curto e estado. Não misturar versões como se fossem duplicatas atuais.
- Campo funciona com Enter; autocomplete é melhoria adicional. Teclado, Escape e foco seguem comportamento acessível.
- Estado vazio explica filtros ativos e oferece “Limpar filtros”; não inventa resposta ou resultado aproximado como fato.

### Filtros por categoria

| Categoria | Filtros que fazem sentido |
|---|---|
| Itens | Tipo, classe compatível, obtenção, raridade conhecida, estado |
| Habilidades | Classe, tipo, elemento documentado, estado |
| Missões | Principal/opcional/diária/semanal, ato, região, faixa de nível quando definida |
| Criaturas | Monstro/chefe, família, região/dungeon, nível documentado |
| Mapas | Campanha/dungeon/acampamento/mundo; território; estado de produção |
| História | Era, reino e nível de spoiler |

Combinar dimensões com AND; múltiplas opções na mesma dimensão usam OR. URL preserva busca, filtros, ordenação e página. Voltar no navegador restaura a consulta. Valores desconhecidos não entram em faixas numéricas; oferecer filtro específico quando útil.

Ordenar por nome e valores pertinentes; colocar desconhecidos ao final. Paginação evita carregar todo o catálogo e todas as imagens. Começar com 25 registros por página, ajustável após ensaio real.

**Comparação incluída na primeira entrega completa:** duas armas compatíveis ou dois broches, com colunas paralelas, efeitos e obtenção. Comparação informa a mesma versão/contexto; não calcula DPS, defesa efetiva ou “melhor item” sem fórmula e premissas verificadas.

## 9. Atlas e mapas

Separar **Atlas de Erdávia** de **Mapas da campanha**. Um visitante pode conhecer os cinco reinos sem interpretar o atlas como seletor de viagem disponível no mobile.

Usar as cartas existentes como base, com leitura ampliada e imagem completa. Para campanha/dungeons, sobrepor marcadores apenas onde houver posição sustentada pela planta, com legenda de escala e aviso “composição proposta” quando aplicável. Um marcador abre NPC, missão, entrada ou encontro correspondente.

Coordenadas de planta e posição na imagem ficam em campos separados, com transformação registrada; não converter pixels em metros sem escala. Quando só houver localização descritiva, usar lista textual de pontos em vez de inventar um pin preciso. Todo marcador tem alternativa em lista para teclado e leitor de tela.

Primeiro lote: atlas mundial, cinco cartas regionais e mapas existentes de campanha/dungeons que passarem pela revisão. Planta ainda sem imagem utilizável recebe ficha textual e indicação da lacuna; não recebe mapa genérico para parecer pronta.

## 10. Fonte única e atualização dos dados

### Ordem editorial

1. Decisão explícita mais recente do PO.
2. Documentos correspondentes da pasta **Direção atual**.
3. Volumes de consulta vigentes na raiz da pasta da Área de Trabalho.
4. Fontes estruturadas equivalentes do projeto, somente se conferidas contra essa edição.
5. Arquivos históricos, consultados para contexto e nunca promovidos automaticamente.

Conflito vira registro de conciliação. O estado efetivamente implementado exige evidência própria; a precedência editorial não permite afirmar que uma mudança de design já está no aplicativo.

### Pipeline proposto

```text
Documentos da Área de Trabalho preservados
  → inventário, edição e hash
  → extração para área privada de trabalho
  → conciliação, unidades, IDs e relações
  → JSON tipado + guias em Markdown revisado
  → validação automática
  → fichas, listagens, busca, atlas e sitemap
  → prévia visual → publicação → histórico
```

PDFs com tabelas exigem conferência visual: uma linha quebrada pode deslocar preço, requisito ou dano para o item seguinte. Não fazer publicação automática a partir do texto extraído. Importação deve ser idempotente, mostrar diferenças e preservar a edição anterior.

Cada registro usa ID editorial estável, separado de `sourceId`/ID legado do jogo, slug, título, categoria, escopo, estado, spoiler, versão, atributos e referências. IDs técnicos nunca viram nomes do jogador.

Cada atributo numérico material pode trazer unidade, contexto e origem. Relações como “vende”, “requer”, “recompensa”, “ocorre em”, “forja” e “desbloqueia” são tipadas; as relações inversas são calculadas. Não digitar listas de drops separadas na criatura e no item.

Referência pública: título do documento, edição, página/seção e nota de revisão. Caminho local, hash e decisão de conciliação ficam no manifesto de manutenção. Não publicar a pasta de produção inteira, caminhos pessoais, instruções de agentes, scripts ou arquivos-fonte de assets.

Usar os documentos como base não implica disponibilizar todos os PDFs para download. O conteúdo editorial relevante será transformado em páginas. O livro integral e os bastidores técnicos exigem decisão editorial própria antes de serem oferecidos como arquivos públicos.

## 11. Arquitetura técnica de implementação

Manter a aplicação Next.js existente e começar com dados versionados no repositório. O volume documental não justifica introduzir banco externo, login ou CMS antes de existir uma necessidade real de edição simultânea.

### Estrutura proposta

```text
src/app/morvelio/wiki/
  layout.tsx
  page.tsx
  busca/page.tsx
  [categoria]/page.tsx
  [categoria]/[slug]/page.tsx
src/components/morvelio/wiki/
  WikiShell, WikiSearch, WikiFilters, WikiTable
  EntityHeader, FactTable, RelatedEntries, SourceNote
  SpoilerGate, AtlasViewer, ItemCompare
src/content/morvelio/wiki/
  schema.ts, categories.ts, registry.ts
  entities/*.json
  guides/                      # conteúdo revisado, sem execução arbitrária
  sources.public.json
src/lib/morvelio/wiki/
  queries.ts, relations.ts, search.ts, routes.ts
tools/morvelio-wiki/
  import, validate, build-search
docs/morvelio-wiki/
  plano, manifesto privado de fontes, conciliações e QA
public/projects/morvelio/wiki/
  icons/, portraits/, maps/
```

As páginas especiais como busca, mundo e atualizações têm resolução explícita; não são aceitas como categorias genéricas por acidente. Tipos e registry controlam quais categorias existem.

- **Renderização:** fichas e páginas editoriais pré-renderizadas quando possível; listagens têm HTML útil; interatividade fica restrita a busca, filtros, spoilers, comparação e mapas.
- **Consulta:** índice compacto gerado no build. A página de resultados resolve a consulta no servidor para links compartilháveis; sugestões no cliente carregam índice resumido sob demanda. Sem enviar todas as fichas e todos os spoilers no JavaScript inicial.
- **Segurança:** campos validados por lista permitida; texto renderizado como texto; Markdown sanitizado; sem importar HTML bruto dos PDFs. Nenhuma chave privada ou caminho local entra no bundle público.
- **SEO:** título e descrição próprios, canonical, breadcrumbs e sitemap das fichas publicadas. Buscas e combinações arbitrárias de filtros ficam fora do sitemap e com política de indexação própria. Respeitar o bloqueio global existente do site.
- **Performance:** imagens responsivas e carregamento tardio, dimensões explícitas, mapa em alta resolução somente ao solicitar. Evitar carregar o livro de aproximadamente 80 MB para abrir a wiki.
- **Métricas de aceite:** Lighthouse de produção ≥90 nas quatro categorias já exigidas pelo site; sem regressão visível de CLS, LCP ou navegação. Registrar ambiente e medições, não prometer resultado antes do teste.

### Pontos reais do repositório que precisam mudar

| Arquivo/área existente | Alteração planejada |
|---|---|
| `src/app/projects/morvelio/page.tsx` | Apresentação específica e entrada clara para a wiki |
| `src/content/projects.ts` | Ícone, apresentação, pilares e links de Morvelio |
| `src/content/types.ts` | Extensões mínimas para CTA/área de conteúdo se necessárias |
| `src/content/navigation.ts` e componentes de navegação | Descoberta da wiki no contexto de Morvelio |
| `src/lib/routes.ts` | Registrar raiz e utilitários das rotas da wiki |
| `src/app/sitemap.ts` | Acrescentar URLs geradas dos registros publicados |
| `src/lib/routes.test.ts` | Substituir pressuposto de página física para cada URL por validação adequada das rotas dinâmicas; manter cobertura das rotas estáticas |
| `src/lib/metadata.ts` | Ícone/arte social atual, com dimensões reais por asset |
| `src/lib/image-delivery.test.ts` e `tools/check-saas-pages.mjs` | Atualizar a expectativa do arquivo de ícone e conferir entrega da nova imagem |
| Novos módulos de conteúdo e validação | Integridade, versões, relações, fontes e busca |

Hoje o teste de rotas fixa 70 URLs e procura `page.tsx` literal para todas. Não desativá-lo para acomodar a wiki: dividir cobertura estática e geração dinâmica, testar slugs conhecidos/desconhecidos e o sitemap gerado. Evitar reescrever o componente genérico de todos os jogos para atender uma necessidade exclusiva de Morvelio.

## 12. Atualização da apresentação de Morvelio

### Composição proposta

1. Novo ícone com **MORVELIO**, título e frase: “Em Velidor o mal já venceu, e só os aventureiros se recusam a aceitar.”
2. Introdução sobre campanha solo, identidade das sete classes e luta por Velidor, com estado do projeto visível.
3. CTAs: **Explorar a wiki** e **Conhecer o mundo**; loja somente quando houver ficha e estado confirmados.
4. Blocos sobre combate, dungeons/Castelo, equipamento/forja e refúgio/casa, marcados conforme implementação.
5. Capturas reais do protótipo separadas de ilustrações promocionais.
6. Erdávia e o livro como universo da saga; continentes, cinco reinos e famílias apresentados no escopo literário correto.
7. Entrada editorial para classes, mapas, itens e missões, seguida dos links de suporte já existentes.

A ambição deve aparecer na riqueza e na conexão do conteúdo. Não anunciar MMO disponível, mundo inteiro explorável, horas de campanha, lançamento, qualidade AAA comprovada ou quantidade ilimitada de conteúdo sem evidência.

**Ícone fonte:** `Divulgação/Nova identidade - Orbe/02B_ICONE_MORVELIO_MONTANHA_TOON_v02_COM_NOME.png`, na Área de Trabalho. Criar derivados web com nomes novos e cache seguro, preservar o master e conferir legibilidade em tamanho real. A imagem quadrada não deve declarar dimensões 1200×630 em metadados; gerar uma composição social adequada ou declarar dimensões verdadeiras.

Há uma divergência a resolver na implementação: banners anteriormente aprovados dizem App Store disponível, enquanto o código atual não tem URL de loja e informa protótipo. Preparar toda a página sem bloqueio; só fechar o botão/status público com a ficha correta verificada. Não inferir endereço de loja ou usar banner contraditório como evidência de distribuição.

## 13. Plano por lotes, com entregas e aceite

| Lote | Trabalho | Entrega verificável | Dependência |
|---|---|---|---|
| W0 · Inventário | Congelar edições, extrair fontes, conciliar classes/broches/eras e listar lacunas | Manifesto, matriz de entidades, relatório de conflitos | Documentos da Área de Trabalho |
| W1 · Fundação | Rotas, shell, navegação, schema, registry e ficha base | Portal e fichas navegáveis em prévia; 404 e fontes funcionando | W0 |
| W2 · Corte completo | Cavaleiro, uma habilidade documentada, broche, missão J13, Bento/receita confirmada e lugar relacionado | Busca → ficha → requisito → lugar; relações inversas; ensaio mobile | W1 e relações confirmadas |
| W3 · Catálogos | Todas as classes, habilidades, itens, receitas, NPCs, criaturas e chefes extraídos e revisados | Listagens com filtros e cobertura conciliada com fontes | W2 aprovado tecnicamente |
| W4 · Jornada e atlas | 93 missões documentadas, regiões, C/P/M, atlas e cinco reinos | Cadeias navegáveis, mapas e ligações com encontros | W3 e dados de mapas |
| W5 · Guias e crônicas | Controles, progressão, forja, casa, endgame e história | Guias relacionados; spoilers sem vazamento na busca/prévias | W3–W4 |
| W6 · Página e ícone | Nova apresentação, iconografia, prévias sociais e acessos globais | Página do jogo integrada à wiki, com status correto | W1; conteúdo final de W3–W5 |
| W7 · Qualidade e publicação | Comparação de itens, revisão integral, testes, prévia e implantação | Relatório, URL de prévia, build e versão recuperável | W0–W6 |

W2 é um ensaio de ponta a ponta para corrigir o modelo antes de cadastrar tudo. **Não é a entrega final pedida.** A primeira versão completa só termina com W0–W7 e a cobertura dos documentos conciliada. Não criar centenas de páginas vazias para contar volume.

Sem prazo artificial neste plano: estimar duração depois de W0, quando houver contagem real de registros, tabelas problemáticas e imagens prontas. Cada lote encerra com evidência, sem necessidade de perguntar novamente sobre decisões já tomadas neste plano.

## 14. Critérios de pronto

### Conteúdo e coerência

- Sete classes corretas; nove broches; nomes pessoais do livro preservados como personagens.
- As 93 missões da edição consultada têm registro ou exceção individual justificada. Se uma versão posterior alterar o total, registrar a diferença.
- Todo registro publicado possui fonte e estado; todo número tem unidade e contexto suficientes.
- IDs únicos; relações sem destino inexistente; cadeias de missão sem ciclos acidentais. Recorrência diária/semanal é modelada separadamente dos pré-requisitos.
- Drops, receitas e vendedores não são inventados; itens futuros não aparecem como obtidos no build.
- Diagramas/planta proposta não são rotulados como captura ou localização comprovada.

### Fluxos a testar

1. Buscar “broche da guarda”, abrir a ficha e chegar à missão J13.
2. Abrir Bento, encontrar os equipamentos que ele realmente forja e consultar custos documentados.
3. Abrir uma classe, navegar por habilidade e arma compatível, voltando à consulta anterior.
4. Seguir uma cadeia de missão até a entrada de dungeon e conferir o requisito.
5. Comparar dois broches sem misturar números de edições diferentes.
6. Explorar Erdávia sem concluir que os cinco reinos estão jogáveis no mobile.
7. Buscar e navegar com spoilers desligados sem revelar finais em texto, imagens ou metadados.

### Interface e engenharia

- Mobile em 360/390 px, tablet e desktop; zoom de 200%; nenhuma rolagem horizontal da página por tabelas ou nomes longos.
- Busca/filtros navegáveis por teclado; foco restaurado nos painéis; controles com alvos adequados; contraste AA; movimento reduzido respeitado.
- Conteúdo principal e links úteis sem JavaScript; nenhuma página depende exclusivamente de tooltip.
- Fichas, imagens, links, filtros compartilháveis, Back, 404, canonical e sitemap conferidos no build de produção.
- Rodar lint, typecheck, testes, auditor de conteúdo e build existentes. Antes do build, conferir o `prebuild`: ele invoca migração de onboarding quando configurada; usar ambiente de prévia isolado, sem apontar uma validação editorial a dados de produção.
- Não expor fontes internas, informações pessoais, credenciais ou assets de terceiros redistribuíveis apenas dentro do jogo.

## 15. Publicação, manutenção e limites

Implementar em branch/check-out isolado se houver outro trabalho em andamento. Há dois arquivos de ícone do Gramelio não rastreados no site; eles são alheios a esta tarefa e devem ser preservados.

Gerar prévia revisável e registrar commit, versão do conjunto de dados e resultados. A autorização deste pedido é para **preparar o plano**; nenhuma mudança em produção faz parte desta entrega. Na futura implementação, a promoção para o domínio deve ocorrer depois da revisão do resultado concreto e da autorização aplicável.

Publicação futura mantém a implantação anterior disponível para recuperação; verificar `/projects/morvelio`, raiz da wiki, fichas, busca, imagens e rotas legais após promover. Se falhar, recuperar a implantação anterior sem apagar os dados editoriais revisados.

Atualizações posteriores: detectar fontes alteradas por hash, importar para staging, revisar diferenças, validar relações, regenerar índices e registrar resumo em “Atualizações da wiki”. Não alterar a data de todas as fichas quando somente uma receita mudar.

**Fora da primeira entrega:** contas de leitores, comentários, fórum, builds de usuários, votação, anúncios, calculadora de dano sem fórmulas verificadas e integração automática ao save. Podem ser expansões posteriores; não são necessários para entregar uma wiki de consulta completa e profissional.

## 16. Ordem de execução para retomada

Começar por **W0 e W1**, preservando a base Desktop e gerando um inventário revisável. Em seguida, completar W2 para validar o modelo de dados e a navegação. Expandir pelo conteúdo real até W7. Se houver conflito, registrar a divergência e manter a informação com estado correto; não preencher lacunas com invenções.

**Entrega deste planejamento:** este Markdown, uma versão HTML de leitura e o manifesto de fontes, copiados para o projeto do jogo e para **Morvelio - Documentação/Wiki do site** na Área de Trabalho. Nenhum código de jogo, site em produção ou PDF original foi modificado.
