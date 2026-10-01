# Blajeen Labs — home interativa

## Direção aprovada

O titular aprovou as três propostas após a entrega da wiki: uma abertura 3D memorável, uma demonstração de criação de produtos e um pequeno desafio de Morvelio. A implementação está no repositório do site, na branch `feat/morvelio-wiki`, junto da wiki já revisada. Nenhum código ou asset do projeto Unity foi alterado.

Prévia: <http://127.0.0.1:3018/>. Ainda não houve publicação no domínio.

## O que funciona

### 1. Laboratório 3D

- Cena original feita com geometria procedural em Three.js: bancada circular, mascote mecânico articulado, terminal, celular, castelo e portal.
- Três estações selecionáveis por botões, teclado ou toque nos objetos; câmera, descrição e destino acompanham a seleção.
- Marca viva preservada. Mascote decorativo fixo ocultado somente na home para evitar duplicação visual.
- No desktop com ponteiro preciso, o módulo 3D carrega quando a bancada entra na tela. No celular/tablet, a própria cena aparece como pôster de 21.470 bytes e o visitante ativa o 3D pelo botão ou pelas estações. Isso evita compilar WebGL na abertura do celular. Renderização para quando a cena sai de vista ou a aba é ocultada; movimento decorativo respeita a preferência do usuário e do sistema.
- Imagem alternativa e navegação HTML quando WebGL não está disponível. Geometrias, materiais, textura, observadores e renderer liberados ao desmontar.
- Modelos e textura do terminal são originais e locais; não há download de modelos de terceiros.

### 2. Configurador de produtos

- Restaurante, loja e serviço com agendamento; identidades Natural, Editorial e Noturna.
- Ilustrações vetoriais originais para pratos, objetos e serviços. Formatos desktop e celular.
- Carrinho com quantidades e soma de preços, opção de entrega/retirada, seleção de serviço e horário, confirmação demonstrativa e limpeza da seleção.
- Trocar negócio limpa a seleção anterior. Produtos e valores são fictícios; não existe cobrança, pedido ou reserva real.
- “Quero um projeto assim” leva as escolhas ao campo de ideia do formulário existente. O usuário continua responsável por revisar e enviar o e-mail; nenhum envio automático foi acrescentado.
- Em 01/10/2026 o titular achou a seção grande demais (2.599 px em 1440 e 3.501 px em 390). O site demonstrativo ganhou um menu próprio, com as páginas Início (catálogo e pedido), Destaques, Avaliações e Contato, que antes vinham empilhadas embaixo do catálogo. As quatro páginas ficam na mesma célula e só a atual aparece, então a prévia tem a altura da maior e não pula na troca. As visões "Site do cliente" e "Painel da operação" subiram para a faixa do formato. No celular os controles viraram faixas curtas (negócio numa linha, entrega e marca lado a lado, sem as dicas), as avaliações correm de lado e "Quero um projeto assim" vem depois da prévia. A seção passou a 1.280 px em 1440 e 1.772 px em 390. A navegação das páginas segue o padrão de abas (setas, Home e End), e os testes estão em `ProductConfigurator.test.tsx`.

### 3. Desafio de Morvelio

- Arena 2D original para navegador: 30 segundos ativos, três pontos de vida, guardião com ataque anunciado, combate com alcance e recarga, fragmento e portal teal de saída.
- Movimento por WASD/setas, espaço para atacar, destino por toque e controles na tela.
- Vitória, derrota, nova tentativa, pausa explícita e pausa automática ao sair da tela/aba.
- A demonstração não altera nem replica o save, os números de balanceamento ou o conteúdo executável do mobile. Esse recorte é informado ao visitante.

## Apresentação e desempenho

A home foi reorganizada em cinco etapas: laboratório, configurador, três trabalhos reais, desafio e contato. Os catálogos completos permanecem acessíveis nas páginas próprias. A abertura usa a identidade escura e o verde da Blajeen, com títulos editoriais e controles de alto contraste.

Derivados WebP preservam os mestres PNG: logo de 1.776.365 para 100.012 bytes; a imagem de laboratório de 2.389.532 bytes foi substituída na nova home por um pôster da cena real de 21.470 bytes. Redução conjunta de aproximadamente 97% para essas duas imagens. O componente da marca passou a usar o derivado também nas outras ocorrências. O derivado adicional `banner-lab-web.webp` preserva uma alternativa compacta da arte original.

## Verificação

- Lint e TypeScript passaram.
- 122 testes, em 18 arquivos, passaram. Cinco testes novos cobrem alcance/recarga, aviso e esquiva, sequência de vitória, derrota e limites de movimento.
- Build de produção passou, sem executar o prebuild de migração de onboarding.
- Lighthouse mobile, no build local de produção: **Performance 93, Acessibilidade 100, Boas práticas 100, SEO 69**. SEO perde pontos pelo bloqueio deliberado de indexação (`noindex` e `robots.txt`) da prévia, mantido conforme o portão de publicação existente. Não é uma medição do domínio público nem substitui testes em aparelhos físicos. Relatório: `qa/lighthouse-mobile.json`.
- A primeira medição encontrou Performance 55 por carregamento antecipado do WebGL no celular; o carregamento mediante interação e o pôster da cena corrigiram o problema. A execução final foi feita com navegador controlado pelo Playwright para evitar um erro de limpeza de perfil temporário do lançador do Lighthouse no Windows.
- `tools/qa-home-interactive.mjs`: inicialização WebGL, estações, três demonstrações, transferência do briefing, partida até a vitória, pausa, 360/390/768/1440 px, movimento reduzido, ausência de JavaScript e ausência de WebGL.
- Evidências atuais e resultado exato de cada execução ficam em `qa/report.json` e nas capturas de `qa/`.
- `npm run check:content` confirmou consistência e listou as 19 pendências de publicação já existentes no site. Esta tarefa não preenche dados jurídicos ou fichas de loja desconhecidos.
- As verificações de tamanho de tela são em navegador automatizado. Desempenho e conforto em aparelhos físicos ainda merecem validação antes de uma campanha de divulgação.

## Manutenção

| Arquivo | Responsabilidade |
|---|---|
| `src/app/page.tsx` | Composição editorial e projetos reais |
| `src/components/home/LabHero.tsx` | Estações, texto e integração da cena |
| `src/components/home/LabScene.ts` | Modelagem, câmera, iluminação e descarte do WebGL |
| `src/components/home/ProductConfigurator.tsx` | Negócios, estilos, carrinho e agendamento demonstrativo |
| `src/components/home/DemoArtwork.tsx` | Ilustrações vetoriais originais |
| `src/components/home/arena.ts` | Regras puras da demonstração de combate |
| `src/components/home/MorvelioChallenge.tsx` | Desenho, controles e pausa |
| `src/components/home/HomeExperience.css` | Layout, cores e adaptação por largura |

Para conferir: `npm run lint`, `npm run typecheck`, `npm test`, `npx next build`, iniciar o servidor e executar `node tools/qa-home-interactive.mjs http://127.0.0.1:3018`. O `npm run build` inclui uma migração de onboarding no prebuild; a auditoria visual usa diretamente o build do Next.

## Estado de entrega

Implementação local e prévia revisável. Sem commit, push ou deploy. A home anterior continua recuperável pelo Git; o plano mestre recebeu a emenda que registra a autorização atual do titular. A wiki de Morvelio permanece integrada à navegação.
