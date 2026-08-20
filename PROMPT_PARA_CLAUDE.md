# Prompt definitivo para o Claude implementar o site Blajeen Labs

Copie todo o conteúdo abaixo e envie ao Claude dentro do diretório
`C:\dev\blajeen-labs`.

---

Você é responsável por implementar do início ao fim o site institucional premium da **Blajeen
Labs**. Trabalhe exclusivamente em `C:\dev\blajeen-labs` e entregue uma implementação funcional,
responsiva, acessível e pronta para revisão de publicação. Não pare em wireframe, proposta, plano ou
mockup: implemente o site, execute os testes possíveis e corrija os problemas encontrados.

## 1. Fonte de verdade obrigatória

Antes de alterar qualquer arquivo, leia integralmente, nesta ordem:

1. `CLAUDE.md`;
2. `docs/PLANO_MESTRE_DO_SITE.md`;
3. `docs/COPY_FINAL_DO_SITE.md`;
4. `docs/LEGAL_LOJAS_E_DADOS.md`;
5. `docs/DECISOES_ANTES_DE_PUBLICAR.md`;
6. `docs/ASSETS_APROVADOS.md`;
7. `README.md`.

Esses arquivos são requisitos, não sugestões. Em caso de conflito, a decisão mais recente registrada
em `CLAUDE.md`, `docs/PLANO_MESTRE_DO_SITE.md` e `docs/ASSETS_APROVADOS.md` prevalece. Não invente
copy, dados empresariais, métricas, funcionalidades, plataformas, datas ou informações jurídicas.

## 2. Limites do trabalho

- Todo arquivo criado ou alterado para o site deve permanecer em `C:\dev\blajeen-labs`.
- `C:\dev\revalio` e `C:\dev\docalio` são fontes externas de verdade e assets. Você pode
  inspecioná-los em modo somente leitura, mas não pode mover, renomear, formatar ou alterar nada
  nesses projetos.
- Preserve alterações existentes que não pertençam à implementação solicitada.
- O protótipo HTML/CSS/JavaScript na raiz é uma referência de identidade e interação. Não o trate
  como arquitetura definitiva.
- Remova da implementação final os projetos fictícios `Oracle Without a Name`, `The Last Signal` e
  `Synthetic Memory`. Os únicos projetos apresentados são Revalio e Docalio.

## 3. Resultado esperado

Implemente o site final usando:

- Next.js com App Router;
- TypeScript estrito;
- Tailwind CSS com tokens centralizados;
- Server Components por padrão;
- Client Components apenas quando necessários para logo viva, menu, drawers e movimento;
- fontes auto-hospedadas, sem chamadas para Google Fonts em produção;
- conteúdo editorial tipado em arquivos locais;
- nenhuma dependência de CMS, analytics, pixels ou cookies não essenciais nesta primeira versão.

Se o projeto Next.js ainda não existir, crie-o no próprio repositório sem apagar os documentos e
assets existentes. Organize componentes por responsabilidade, incluindo `brand`, `navigation`,
`overlays`, `projects` e `layout`.

## 4. Identidade visual correta

Não confunda as duas versões da marca.

### Logo institucional do site

O site usa a **logo viva BLAJEEN**:

- wordmark `BLAJEEN` com os dois `E` desenhados como olhos;
- pupilas verde-ácido que acompanham o ponteiro com deslocamento pequeno e amortecido;
- piscadas orgânicas em intervalos pseudoaleatórios e possibilidade rara de piscada dupla;
- `LABS` como qualificador secundário;
- gosma verde-ácido aderida aos pés das letras, com superfície irregular, brilho úmido e poucos
  pingos de comprimentos diferentes;
- a gosma deve ocupar aproximadamente 8–12% da altura visual da marca, sem cobrir olhos ou letras;
- os pingos podem pulsar lentamente em escala vertical, mas não devem se desprender, espirrar ou
  escorrer pela página;
- com `prefers-reduced-motion`, aba oculta ou movimento desativado, olhos e gosma ficam estáticos;
- a logo viva é obrigatória no hero e pode ter uma versão reduzida no header;
- nunca adicionar boca, rosto externo ou transformar os olhos em mascote separado.

### Assinatura presente nos banners

Os banners já possuem uma assinatura simples `BLAJEEN LABS`, sem olhos. Essa é uma exceção criada
para leitura sobre as imagens e **não substitui a logo viva do site**. Não redesenhe, não regenere e
não aplique outra logo por cima dos banners.

### Sistema premium do site

- fundo principal `#090A08`;
- superfícies `#11130F` e `#171A15`;
- texto principal `#E7E7DF`;
- texto secundário mineral com contraste AA;
- verde ácido `#C9FF3D` limitado a aproximadamente 5–8% da composição;
- bordas minerais de 1 px e baixa opacidade;
- sombras largas, suaves e discretas;
- blur apenas em header, drawer e camadas elevadas;
- muito espaço negativo, composição editorial e mídia cinematográfica;
- evitar neon excessivo, cards SaaS, glassmorphism genérico, gradientes saturados, dashboards,
  aparência de template e excesso de chips.

O resultado deve parecer um laboratório independente premium, autoral e ativo — curioso,
tecnológico e cinematográfico, mas nunca “cyberpunk gamer”.

## 5. Banners obrigatórios

Use somente estes arquivos finais:

- `public/projects/revalio/revalio-banner-final.png`;
- `public/projects/docalio/docalio-banner-final.png`.

Regras:

- Revalio aparece como `EXPERIMENT 01 / ACTIVE`;
- Docalio aparece como `EXPERIMENT 02 / FORMING` ou `IN DEVELOPMENT`;
- usar os banners na home, no hero de cada projeto e nas gavetas de prévia;
- preservar a proporção completa da arte;
- não usar `object-fit: cover` quando isso cortar o nome do jogo ou `BLAJEEN LABS`;
- gerar derivados responsivos AVIF/WebP sem alterar cores, textos ou composição;
- nunca inserir texto editorial sobre o título já presente dentro da imagem;
- Revalio pode receber prioridade somente quando for o LCP da rota atual; Docalio deve carregar de
  forma preguiçosa quando estiver abaixo da dobra;
- conferir visualmente mobile, tablet e desktop.

## 6. Arquitetura e conteúdo

Implemente todas estas rotas:

```text
/
/projects/revalio
/projects/docalio
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
```

Também implemente:

- `robots.txt`;
- `sitemap.xml`;
- manifest web;
- metadados por rota;
- Open Graph do estúdio e dos dois jogos;
- páginas 404 e erro coerentes com a identidade.

Use a copy de `docs/COPY_FINAL_DO_SITE.md`. Não substitua o texto aprovado por slogans genéricos.

### Home

Siga esta ordem:

1. boot breve, no máximo 1,4 s e apenas na primeira visita da sessão;
2. hero com logo viva, slogan e apresentação curta;
3. The Lab;
4. showcases amplos de Revalio e Docalio;
5. estado atual de desenvolvimento;
6. Learning can be an adventure;
7. Built from curiosity;
8. What’s next?;
9. footer com contato, projetos, sobre, privacidade e termos.

Não transforme os projetos em dois cards genéricos lado a lado. Use showcases editoriais grandes,
com composições alternadas e os banners como protagonistas.

### Revalio

- apresentar como experiência gamificada de aprendizagem médica;
- usar apenas recursos confirmados pelo build e documentação em `C:\dev\revalio`;
- explicar trilhas, decisões, revisão e progressão somente quando existirem de fato;
- usar capturas reais na galeria, sem mockups que prometam funcionalidades inexistentes;
- incluir aviso educacional/médico visível;
- incluir suporte, privacidade, termos e exclusão de conta.

### Docalio

- tratar como projeto em desenvolvimento;
- apresentar o conceito de RPG/simulação médica com casos ficcionais;
- não prometer multiplayer, IA generativa, situações infinitas, plataformas ou lançamento sem prova;
- não criar pré-registro sem fluxo, armazenamento e política próprios;
- incluir suporte, privacidade, termos e exclusão de conta.

## 7. Header, menu e gavetas

Crie uma navegação contemporânea e premium, nunca um dropdown básico.

### Header

- flutuante e compacto;
- carvão translúcido depois do primeiro scroll;
- logo viva/reduzida à esquerda;
- estado curto do laboratório ao centro em telas largas;
- botão `MENU` à direita com alvo mínimo de 44×44 px;
- borda mineral, blur moderado e sinal verde-ácido muito discreto;
- sem navegação dependente de hover.

### Drawer principal

- desktop: drawer lateral direito entre 420 e 560 px, altura total;
- mobile: drawer de tela inteira respeitando safe areas;
- scrim translúcido sobre o conteúdo;
- links indexados para Projetos, Sobre, Contato, Suporte e Privacidade;
- atalhos secundários para Revalio e Docalio com estados reais;
- animação de 240–360 ms usando `transform` e `opacity`;
- `prefers-reduced-motion` remove o deslizamento;
- usar `aria-expanded`, `aria-controls`, `aria-current`, foco preso, fundo `inert`, scroll lock,
  fechamento por `Esc`, botão explícito e clique no scrim;
- ao fechar, devolver o foco ao botão que abriu o menu.

### Gavetas de projeto

- cada showcase pode abrir uma prévia sem abandonar a home;
- desktop: drawer lateral com banner completo, estado, resumo, plataformas confirmadas e CTAs
  `Ver projeto` e `Suporte`;
- mobile: bottom sheet com no máximo 88dvh, cabeçalho fixo e corpo rolável;
- nunca empilhar drawers ou abrir automaticamente;
- as gavetas são melhoria progressiva: links e páginas devem funcionar sem JavaScript;
- políticas, termos, suporte completo e exclusão de dados permanecem em páginas próprias.

## 8. Movimento

O movimento deve reforçar a narrativa de laboratório sem atrapalhar leitura:

- olhos e gosma da logo;
- revelações curtas no scroll;
- scanline única em foco/hover dos projetos;
- parallax de mídia limitado a 2%;
- feedback de links em até 150 ms;
- nenhuma animação essencial à compreensão;
- sem scroll hijacking, autoplay com áudio, carrossel automático, vídeo obrigatório ou WebGL sem
  função narrativa;
- oferecer controle `MOTION: ON/OFF` e respeitar `prefers-reduced-motion`.

## 9. Privacidade, exclusão de dados e lojas

Implemente os textos e fluxos públicos definidos em `docs/LEGAL_LOJAS_E_DADOS.md`.

- páginas jurídicas devem funcionar sem JavaScript, HTTPS e login;
- páginas de exclusão devem ser próprias e diretamente acessíveis;
- se um app permite criar conta, a exclusão também precisa ser iniciável dentro do app; o site não
  substitui essa obrigação;
- a página web de exclusão necessária ao Google Play deve explicar solicitação, autenticação,
  categorias apagadas ou retidas, prazo e contato, conforme o comportamento real do app;
- não declarar coleta, retenção, criptografia, SDKs, compartilhamento ou exclusão sem auditar o build;
- não apresentar Revalio ou Docalio como dispositivo médico, diagnóstico ou prescrição;
- não permitir entrada de dados reais de pacientes;
- campos entre colchetes são bloqueadores humanos: mantenha TODOs claros no código e nunca publique
  placeholders como se fossem informações válidas;
- não invente controlador, endereço, e-mail, DPO, CNPJ, prazos ou jurisdição;
- mantenha links estáveis para App Store Connect e Google Play Console.

## 10. Acessibilidade, desempenho e qualidade

- HTML semântico, landmarks, skip link e headings coerentes;
- contraste WCAG AA;
- foco sempre visível;
- teclado completo em menus, drawers, bottom sheets e accordions;
- alvos de toque com pelo menos 44×44 px;
- nenhuma informação somente em hover;
- LCP <= 2,5 s, INP <= 200 ms e CLS <= 0,1 como metas;
- JavaScript inicial mínimo;
- imagens com `sizes`, dimensões e proporção declaradas;
- fontes locais e sem rede externa obrigatória;
- conteúdo principal e páginas legais utilizáveis sem JavaScript;
- metas Lighthouse >= 90 para Performance, Accessibility, Best Practices e SEO em produção.

## 11. Testes e validação obrigatórios

Antes de considerar pronto:

1. execute instalação, lint, typecheck, testes e build de produção;
2. corrija erros e warnings relevantes;
3. teste 360, 390, 768, 1024, 1440 e 1920 px;
4. verifique que nenhum banner corta o título ou a assinatura;
5. teste abertura/fechamento dos drawers, foco preso, `Esc`, scrim, scroll lock, retorno de foco e
   navegação Back;
6. teste `prefers-reduced-motion` e `MOTION: OFF`, incluindo olhos e gosma estáticos;
7. teste navegação por teclado e foco visível;
8. valide todos os links, rotas jurídicas, sitemap, robots e metadados;
9. confirme que não existem projetos fictícios, dados inventados ou placeholders jurídicos visíveis;
10. compare textos de privacidade e lojas com o comportamento real disponível dos apps.

Se alguma validação depender de informação humana ainda não fornecida, implemente todo o restante,
registre o bloqueador precisamente em `docs/DECISOES_ANTES_DE_PUBLICAR.md` e não invente a resposta.

## 12. Forma de trabalhar e entrega

- Primeiro inspecione o repositório e faça um plano curto de execução.
- Depois implemente sem interromper o trabalho para perguntas que possam ser respondidas pelos
  arquivos locais.
- Faça mudanças pequenas, coerentes e verificáveis.
- Não apague documentos, banners ou assets aprovados.
- Não use imagens provisórias quando já existe asset final.
- Não declare conclusão sem executar os comandos de validação disponíveis.
- Ao finalizar, informe objetivamente:
  - o que foi implementado;
  - arquivos e rotas principais;
  - comandos executados e resultados;
  - bloqueadores humanos restantes;
  - instruções exatas para rodar e revisar localmente.

O critério final é: o site precisa parecer um estúdio independente premium e autoral, preservar a
logo viva com olhos e gosma, apresentar Revalio e Docalio com seus banners aprovados, oferecer menu
e gavetas modernos e funcionar como infraestrutura pública confiável para privacidade, suporte,
termos e exclusão de dados exigidos pelas lojas.

---
