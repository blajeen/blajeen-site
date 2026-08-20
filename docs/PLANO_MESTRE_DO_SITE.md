# Plano mestre — site institucional Blajeen Labs

Versão de planejamento: 16 de agosto de 2026.
Emenda do titular: 17 de agosto de 2026 — ver "Decisões que substituem este plano", logo abaixo.

## Decisões que substituem este plano (17/08/2026)

Estas decisões do titular prevalecem sobre o texto original onde houver conflito.

1. **A home cabe em uma tela.** A ordem de nove seções em rolagem (§4) foi substituída por cinco
   abas — `01 O laboratório`, `02 Experimentos`, `03 Estado`, `04 Hipótese`, `05 Origem` — dentro
   de um bloco de altura fixa. O painel da aba rola por dentro quando o conteúdo é mais alto; a
   página não. O rodapé continua abaixo, a um scroll curto, porque os links jurídicos precisam
   permanecer alcançáveis.
   As abas são melhoria progressiva: sem JavaScript os cinco painéis aparecem empilhados e cada
   item da barra é um link comum para a sua âncora.

2. **A interface é toda em português.** A regra de `COPY_FINAL_DO_SITE.md` que tratava o inglês
   como assinatura de marca foi revogada. Nome da marca, nomes dos produtos e nomes de lojas
   continuam como são. A assinatura passou a ser
   *"Criamos coisas estranhas. E fazemos com que importem."*

3. **A logo do hero é a arte renderizada** `public/brand/blajeen-logo.png`, que já traz os dois
   `E` como lentes acesas e a gosma na base. O site mantém a marca viva apagando as lentes por um
   instante, no mesmo ritmo do mascote. A marca tipográfica em CSS (`LiveWordmark`) continua no
   header, onde vetor lê melhor que raster em 20 px.

4. **Mascote e frasco pontuam os cantos** das seções com texto, atrás do conteúdo e com opacidade
   baixa. Regras completas em `ASSETS_APROVADOS.md`.

O restante deste documento continua valendo: identidade, sistema visual, banners, gavetas,
acessibilidade, rotas e critérios de publicação não mudaram.

---

Este documento adapta o briefing institucional ao protótipo já criado e define o trabalho que deve
ser seguido na implementação definitiva. Ele é deliberadamente específico para que outro agente
possa executar sem reinterpretar a identidade da marca.

## 1. Estado atual

Existe um protótipo estático funcional na raiz:

- `index.html`: hero, sequência de boot, manifesto, arquivos de experimentos, capacidades e footer;
- `styles.css`: identidade escura, grid técnico, tipografia, responsividade e movimento reduzido;
- `script.js`: piscada orgânica, pupilas reativas, revelação por scroll, menu e controle de movimento;
- `favicon.svg`: síntese reduzida dos dois `E`/olhos.

Existem dois banners finais aprovados. Claude deve ler `docs/ASSETS_APROVADOS.md`, usar somente os
arquivos sem número de versão e não recuperar tentativas anteriores.

O protótipo é referência visual e de interação. Não é a arquitetura final nem contém a narrativa
correta dos produtos: os três experimentos fictícios devem ser substituídos por Revalio e Docalio.

## 2. Decisão de marca

### Posicionamento

**Blajeen Labs is an independent game studio and experimental technology lab.**

A marca cria produtos próprios. Ela não vende horas de desenvolvimento, não oferece consultoria e
não tenta parecer maior do que é. Sua força é a combinação de curiosidade, precisão e ambição.

### Ideia central

O laboratório não é apenas cenário: ele parece estar ativo. A interface observa, classifica e
revela os projetos como experimentos reais. A estranheza deve nascer de pausas, pequenos sinais e
comportamentos raros — nunca de uma avalanche de glitches.

### Assinatura

**Build strange things. Make them matter.**

Essa frase substitui slogans genéricos e une os dois lados da marca: experimentar e construir algo
que tenha consequência real.

### Personalidade

- curiosa, não excêntrica por obrigação;
- confiante, não arrogante;
- pequena e autoral, não improvisada;
- tecnológica, não “cyberpunk gamer”;
- cinematográfica, sem sacrificar leitura e desempenho.

## 3. Sistema visual premium

| Elemento | Diretriz |
|---|---|
| Fundo principal | preto orgânico `#090A08` |
| Superfície | carvão `#11130F`; elevada em `#171A15` |
| Texto principal | off-white mineral `#E7E7DF` |
| Texto secundário | cinza mineral `#9A9D93`, sempre em contraste WCAG AA |
| Sinal da marca | verde ácido `#C9FF3D`, limitado a 5–8% da composição |
| Brilho técnico | verde pálido `#E6FF9A`, somente em reflexos e foco |
| Estado neutro | aço escuro `#30352D` para bordas e divisores |
| Tipografia display | grotesca forte, ampla, precisa e com tracking controlado |
| Tipografia editorial | sans humanista limpa para textos longos |
| Tipografia técnica | monoespaçada somente para índices, estado e coordenadas |
| Textura | ruído procedural quase imperceptível e reflexos suaves |
| Grid | 12 colunas, máximo de 1440 px e grandes áreas de respiro |

As fontes finais devem ser auto-hospedadas e licenciadas. Até a escolha definitiva, Inter e uma
mono de código aberto são aceitáveis. O build final não deve chamar Google Fonts.

### O que “premium” significa neste projeto

- hierarquia editorial clara, com poucos elementos grandes e bem posicionados;
- espaço negativo generoso; não preencher a tela com cards, chips e métricas decorativas;
- showcases com largura ampla, proporção cinematográfica e transições discretas;
- bordas de 1 px em branco com 6–10% de opacidade, nunca contornos pesados;
- raios de 24–32 px em painéis grandes, 14–18 px em controles e formato pill apenas em estados;
- sombras largas e suaves, com baixa opacidade e leve matiz verde/carvão; evitar sombra preta dura;
- blur entre 16–24 px somente em header, drawer e camadas elevadas;
- reflexos de gradiente podem percorrer superfícies lentamente, sem loop chamativo;
- ícones lineares consistentes, com traço entre 1,5 e 2 px;
- imagens dos jogos fornecem cor e personalidade; a interface permanece escura, neutra e sofisticada;
- nenhuma seção pode parecer template de startup, dashboard administrativo ou landing page de SaaS.

### Ritmo de layout

- desktop usa margens laterais entre 48 e 96 px, conforme largura disponível;
- seções principais usam espaçamento vertical entre 120 e 180 px;
- mobile usa margens de 20–24 px e intervalos de 72–104 px;
- títulos podem ocupar 6–9 colunas; textos corridos ficam limitados a 60–70 caracteres por linha;
- alternar blocos de mídia, texto e espaço vazio; não repetir a mesma grade em todas as seções;
- divisores e linhas técnicas terminam antes da borda para manter sensação de objeto projetado.

### Logo viva do site

- usar `BLAJEEN` como wordmark principal e `LABS` como qualificador secundário;
- construir os dois `E` como olhos dentro da própria geometria tipográfica, preservando leitura;
- as pupilas acompanham o ponteiro com deslocamento pequeno e amortecido;
- piscar em intervalos pseudoaleatórios, com possibilidade rara de piscada dupla;
- pausar reações quando a aba não estiver visível, quando o usuário desativar movimento ou quando
  `prefers-reduced-motion` estiver ativo;
- fornecer estados aberto, fechado, monocromático, claro, escuro, favicon e marca reduzida;
- não acrescentar boca, rosto externo ou transformar os olhos em mascote independente;
- adicionar uma camada de gosma verde-ácido aderida aos pés das letras, com superfície irregular,
  brilho úmido e poucos pingos de comprimentos diferentes;
- limitar a gosma a aproximadamente 8–12% da altura visual da marca, sem cobrir os olhos nem reduzir
  a leitura de `BLAJEEN`;
- os pingos podem oscilar lentamente em escala vertical, sem se desprender, espirrar ou escorrer pela
  página; em `prefers-reduced-motion`, permanecer completamente estáticos;
- a logo viva é obrigatória no hero e pode aparecer reduzida no header.

### Exceção para os banners

- sobre as artes de Revalio e Docalio, usar a assinatura simples `BLAJEEN LABS`, sem olhos;
- a fonte de verdade dessa aplicação é `public/brand/blajeen-labs-simple.svg`;
- essa versão existe para legibilidade sobre imagens e não redefine a identidade institucional;
- nunca substituir a logo viva do site pela assinatura de banner.

## 4. Arquitetura de informação

### Rotas públicas

```text
/
/projects/revalio
/projects/docalio
/projects/gramelio
/about
/contact
/privacy
/terms
/support
/revalio/privacy
/revalio/terms
/revalio/support
/revalio/delete-account
/docalio/privacy
/docalio/terms
/docalio/support
/docalio/delete-account
/gramelio/privacy
/gramelio/terms
/gramelio/support
/gramelio/delete-account
```

Também `/novidades`, criada em 18/08/2026. O bloco de rotas do Gramelio entrou em 19/08/2026, junto
com o terceiro experimento: **todo jogo do estúdio nasce com as cinco rotas** — página, suporte,
política, termos e exclusão —, porque é isso que as lojas cobram e é o que impede o produto de
existir no site sem a infraestrutura pública correspondente.

Também gerar `/robots.txt`, `/sitemap.xml`, manifest web, Open Graph e páginas 404/500 coerentes.

### Home — ordem definitiva

1. **Boot breve** — no máximo 1,4 s na primeira visita; pular em visitas seguintes da sessão.
2. **Hero** — logo viva com olhos, slogan e apresentação curta.
3. **The Lab** — filosofia do estúdio em texto editorial curto.
4. **Projects** — dois showcases grandes, não cards paralelos.
5. **Currently in development** — estado real, sem datas falsas.
6. **Learning can be an adventure** — conexão emocional entre medicina, jogo e educação.
7. **Built from curiosity** — origem do fundador sem formato de currículo.
8. **What’s next?** — expansão conceitual, sem anunciar produto inexistente.
9. **Footer** — contato, projetos, sobre, privacidade e termos.

### Página Revalio

- hero próprio e visual reconhecível do jogo;
- posicionamento como experiência gamificada de aprendizagem médica;
- mostrar trilhas, decisões, revisão e progressão apenas com evidências do build;
- galeria de capturas reais, nunca mockups que impliquem recursos inexistentes;
- estado do projeto e plataformas confirmadas;
- aviso educacional/médico visível;
- links para suporte, política, termos e exclusão de conta.

### Página Gramelio

Acrescentada em 19 de agosto de 2026.

- tratá-lo como `em desenvolvimento`, e mais cedo que o Docalio: existe arte e desenho, não existe
  código;
- apresentar o ciclo do jogo — toque, grama, estômago, volta ao curral — sem número de fases,
  mundos, moedas ou preço;
- separar desenho de build: a página lista pilares sob o rótulo "no desenho" e não usa a seção "o
  que existe no build hoje" enquanto não houver aplicativo auditado;
- não anunciar campanhas futuras como confirmadas, nem plataforma, nem data;
- não publicar as folhas de referência visual como se fossem capturas do jogo.

### Página Docalio

- tratá-lo como `in development`;
- apresentar o conceito de RPG/simulação médica com progressão e casos ficcionais;
- não prometer “situações infinitas”, multiplayer, IA generativa, lançamento ou plataformas até
  esses itens existirem;
- CTA permitido: acompanhar o laboratório ou entrar em contato. Não criar pré-registro sem fluxo e
  política próprios.

## 5. Composição dos showcases

Revalio entra como `EXPERIMENT 01 / ACTIVE`: imagem ampla, nome, categoria, frase, status e link.
Docalio entra como `EXPERIMENT 02 / FORMING`: composição diferente, mais profunda e narrativa, mas
com a mesma gramática visual. Gramelio entra como `EXPERIMENTO 03 / EM FORMAÇÃO` e volta à direção
do primeiro: a direção alterna a cada experimento, e é isso que cria ritmo sem virar coleção de
cards.

Assets obrigatórios:

- `public/projects/revalio/revalio-banner-final.png`;
- `public/projects/docalio/docalio-banner-final.png`;
- `public/projects/gramelio/gramelio-banner-final.png` — 1536 × 1024, proporção diferente das duas
  primeiras; ver `ASSETS_APROVADOS.md`.

No mobile:

- mídia antes do texto;
- status e índice sempre visíveis;
- nenhuma informação depende de hover;
- logo cabe sem quebrar, cortar ou perder a palavra `LABS`;
- telemetria secundária é removida, não espremida;
- imagens usam `aspect-ratio`, `sizes` e recorte editorial específico.

### Uso obrigatório dos banners

- a home usa o banner final de cada jogo no seu próprio showcase, na ordem dos experimentos;
- cada página de produto reutiliza seu banner como hero 16:9 antes da galeria de capturas reais;
- os PNGs são os mestres; o build gera AVIF/WebP responsivos sem alterar cor, tipografia ou marca;
- manter a imagem inteira em desktop e mobile; não aplicar `object-fit: cover` quando isso cortar o
  nome do jogo ou a assinatura Blajeen Labs;
- na home, carregar Revalio com prioridade apenas quando ele for o LCP e deixar Docalio em lazy load;
- nas páginas individuais, somente o banner daquele produto recebe prioridade;
- não colocar texto editorial por cima dos títulos já presentes nas artes;
- derivados para Open Graph devem respeitar área segura e ser conferidos visualmente em 1200×630.

## 6. Navegação moderna e sistema de gavetas

### Header

- header flutuante e compacto, com fundo translúcido somente após o primeiro scroll;
- sua superfície segue a atmosfera do laboratório: carvão translúcido, borda mineral e um sinal
  verde ácido muito sutil no estado ativo;
- logo tipográfica à esquerda; estado curto do laboratório ao centro em telas largas; botão `MENU`
  à direita com alvo mínimo de 44×44 px;
- borda de 1 px, blur moderado e sombra muito leve; evitar aparência de barra de aplicativo genérica;
- esconder ao rolar para baixo e reaparecer ao rolar para cima somente depois de validar que isso não
  prejudica descoberta, teclado ou leitores de tela;
- sem megamenu tradicional e sem navegação dependente de hover.

### Drawer de navegação

- desktop: painel lateral direito com largura entre 420 e 560 px, ocupando toda a altura;
- mobile: drawer de tela inteira, respeitando `safe-area-inset-*` e mantendo o botão de fechar sempre
  visível;
- fundo da página recebe scrim translúcido; a gaveta usa carvão profundo, blur de 20–24 px, borda
  mineral e pequenos sinais verde-ácido alinhados à identidade do laboratório;
- links aparecem com índice, nome e uma descrição curta: `01 Projetos`, `02 Sobre`, `03 Contato`,
  `04 Suporte`, `05 Privacidade`;
- Revalio e Docalio aparecem como atalhos secundários com estado real do projeto;
- entrada e saída entre 240–360 ms usando somente `transform` e `opacity`;
- `prefers-reduced-motion` elimina o deslizamento e mantém apenas transição curta de opacidade;
- o acionador usa `aria-expanded` e `aria-controls`; ao abrir, mover foco para o título da gaveta ou
  primeiro link; prender o foco; fechar com `Esc`, clique no scrim e botão explícito; devolver foco ao
  acionador e remover scroll lock ao fechar;
- usar elemento `nav` com lista real de links. A rota atual recebe `aria-current="page"`.

### Gavetas de projeto

- cada showcase pode abrir uma gaveta de prévia sem abandonar a home;
- desktop: painel lateral com banner 16:9 completo, estado, resumo, plataformas confirmadas e dois
  CTAs: `Ver projeto` e `Suporte`;
- mobile: bottom sheet com altura máxima de 88dvh, alça visual não interativa, cabeçalho fixo e corpo
  rolável;
- cada gaveta herda discretamente a paleta do projeto apenas na imagem e em um pequeno acento;
  superfícies, tipografia e controles continuam pertencendo ao sistema Blajeen Labs;
- a gaveta nunca substitui `/projects/revalio` ou `/projects/docalio`; o card/showcase continua sendo
  um link sem JavaScript e a gaveta é melhoria progressiva;
- não abrir gaveta automaticamente, não empilhar gavetas e não manter duas camadas modais abertas;
- fechar a prévia antes de navegar e atualizar a URL somente quando houver estratégia explícita para
  histórico/Back; caso contrário, não alterar a URL;
- avisos legais, políticas, termos e exclusão de conta permanecem em páginas próprias, nunca dentro
  de accordion ou drawer transitória.

### Outros elementos modernos permitidos

- accordions apenas para FAQ e detalhes não essenciais, com títulos sempre legíveis;
- pequenos painéis de status, chips de plataforma e divisores animados com moderação;
- transições compartilhadas entre banner e página do produto somente se não prejudicarem LCP;
- gradientes, glassmorphism e brilho devem apoiar hierarquia, não cobrir texto nem competir com as
  artes dos jogos;
- evitar carrossel automático, excesso de cartões, cursor obrigatório, scroll hijacking e modais de
  entrada.

## 7. Movimento e interação

| Interação | Comportamento | Limite |
|---|---|---|
| Boot | barra curta + `SYSTEM ONLINE` | uma vez por sessão |
| Marca | entrada breve por opacidade | sem deformar letras ou repetir em loop |
| Olhos | piscada e acompanhamento amortecido | movimento percebido <= 6 px |
| Gosma da logo | pulsação viscosa lenta nos pingos | sem gotas soltas; estática em reduced motion |
| Drawer principal | slide lateral + scrim | 240–360 ms; foco preso e `Esc` fecha |
| Gaveta de projeto | lateral no desktop / bottom sheet no mobile | uma camada por vez |
| Scroll | revelação de opacidade/posição | 500–900 ms |
| Projetos | scanline única no foco/hover | sem loop permanente |
| Cursor | halo ambiental | ocultar em touch/reduced motion |
| Parallax | somente mídia de projeto | deslocamento máximo 2% |
| Links | sublinhado/sinal e foco claro | feedback em <= 150 ms |

Não usar smooth-scroll de terceiros, WebGL sem função narrativa, vídeo de fundo obrigatório,
áudio automático ou animações que bloqueiem navegação.

## 8. Arquitetura técnica final

O protótipo atual pode permanecer como referência até a migração. A implementação final deve usar:

- Next.js com App Router e TypeScript estrito;
- Tailwind CSS para tokens/utilitários, sem substituir componentes semânticos por classes repetidas;
- conteúdo editorial tipado em arquivos locais; não adicionar CMS nesta fase;
- Server Components por padrão e Client Components somente para menu e movimento;
- rotas legais pré-renderizadas e independentes de JavaScript;
- imagens otimizadas, fontes locais e nenhum SDK de analytics na primeira versão;
- testes unitários para utilitários e testes de navegação/a11y para rotas críticas;
- lint, typecheck, build e teste executáveis por comandos documentados.

Estrutura proposta:

```text
src/
  app/
    projects/revalio/
    projects/docalio/
    revalio/{privacy,terms,support,delete-account}/
    docalio/{privacy,terms,support,delete-account}/
  components/brand/
  components/layout/
  components/navigation/
  components/projects/
  components/overlays/
  content/
  lib/
public/brand/
public/projects/revalio/
public/projects/docalio/
docs/
```

## 9. SEO, compartilhamento e confiança

- títulos e descrições únicos por rota;
- canonical no domínio definitivo;
- schema `Organization` somente com dados verdadeiros;
- schema `SoftwareApplication`/`VideoGame` apenas depois de existirem URLs de loja;
- Open Graph 1200×630 para estúdio e cada produto;
- `hreflang` somente quando houver traduções completas;
- e-mail e endereço de suporte reais antes de publicação;
- página de contato simples por `mailto:` na primeira versão, evitando coleta desnecessária.

## 10. Desempenho e acessibilidade

- LCP <= 2,5 s, INP <= 200 ms e CLS <= 0,1 no percentil real quando houver tráfego;
- JavaScript inicial mínimo; logo deve aparecer mesmo se JS falhar;
- contraste AA, foco visível, landmarks, skip link e hierarquia de headings;
- botões e links com alvo mínimo de 44×44 CSS px em touch;
- drawers usam `dialog` modal ou implementação equivalente auditada, `inert` no fundo, foco preso,
  retorno de foco e scroll lock sem salto de layout;
- navegação e páginas de produto continuam funcionais sem JavaScript; gavetas são melhoria progressiva;
- respeitar `prefers-reduced-motion` e armazenar a escolha de movimento localmente;
- ruído e grid marcados como decorativos;
- textos em português do Brasil; frases em inglês sempre compreensíveis pelo contexto.

## 11. Fases de execução para Claude

### Fase A — fundação

- criar a aplicação Next/TypeScript no próprio repositório;
- converter tokens e fontes;
- recriar a logo viva com olhos como componente testável e acessível;
- implementar header, drawer principal e primitives acessíveis de overlay;
- configurar lint, typecheck, build, sitemap e metadados.

### Fase B — narrativa

- implementar a home com a copy aprovada;
- substituir experimentos fictícios;
- criar páginas Revalio, Docalio, About e Contact;
- integrar os dois banners finais nos showcases, heroes e gavetas de projeto;
- implementar gavetas de prévia com fallback para links normais;
- usar somente screenshots/assets fornecidos ou claramente marcados como concept art.

### Fase C — confiança e lojas

- implementar todas as rotas legais e de suporte;
- garantir links cruzados e URLs estáveis;
- preencher metadados das lojas a partir de `LEGAL_LOJAS_E_DADOS.md`;
- não publicar enquanto os bloqueadores humanos continuarem abertos.

### Fase D — QA

- testar 360, 390, 768, 1024, 1440 e 1920 px;
- teclado, leitor de tela básico, redução de movimento e contraste;
- testar abertura, fechamento, foco preso, `Esc`, scrim, retorno de foco e botão Back nas gavetas;
- conferir visualmente os dois banners em 360, 390, 768, 1440 e 1920 px sem cortes de títulos/marca;
- build sem rede externa para fontes;
- validar links, formulários, 404, sitemap e metadados;
- Lighthouse em build de produção;
- comparar políticas com builds finais de Revalio e Docalio.

## 12. Critério de pronto

O site só está pronto quando parece um estúdio real **e** funciona como infraestrutura pública das
lojas: cada produto possui página, suporte, política, termos e exclusão acessíveis; nenhuma frase
promete recurso futuro como presente; todos os campos legais estão preenchidos; e os formulários das
lojas foram respondidos a partir do comportamento auditado do build.
