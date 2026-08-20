# Blajeen Labs

Site institucional da Blajeen Labs e páginas públicas de Revalio, Docalio e Gramelio.

Estúdio independente que cria produtos próprios. Não é agência, consultoria nem software house.

## Rodar

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para revisar o que vai ao ar, use o build de produção — é ele que gera AVIF/WebP dos banners e
aplica os cabeçalhos de segurança:

```powershell
npm run build
npm run start
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run start` | serve o build |
| `npm run lint` | ESLint com as regras do Next e do React Compiler |
| `npm run typecheck` | TypeScript estrito, sem emitir |
| `npm run test` | testes de conteúdo, rotas, marca e acessibilidade das gavetas |
| `npm run check:content` | portão de conteúdo: bloqueadores humanos, campos entre colchetes, projetos fictícios |
| `npm run verify` | lint + typecheck + test + check:content + build |
| `npm run build:assets` | regenera ícones e imagens Open Graph a partir dos masters |
| `npm run qa:shots` | captura as 22 rotas em 6 larguras e confere que nenhum banner é cortado |
| `npm run qa:interacao` | teclado, foco preso, `Esc`, scrim, scroll lock e movimento reduzido, em navegador real |
| `npm run qa` | os dois QA acima |
| `node tools/check-lighthouse.mjs` | Lighthouse nas rotas principais, desktop e mobile |

Os comandos de QA precisam do servidor rodando (`npm run start` em outro terminal). Use
`BASE_URL` para apontar para outro endereço.

## Deploy na Vercel

O projeto é um app Next padrão: a Vercel detecta tudo sozinha, sem `vercel.json`.

```powershell
npx vercel login      # interativo, uma vez por máquina
npx vercel            # deploy de revisão (preview)
npx vercel --prod     # deploy de produção
```

`.vercelignore` mantém fora do upload os perfis de Chrome, as capturas de QA e os masters em
`Icones/` — eles não entram no build, que lê apenas o que já está em `public/`.

### Indexação é automática e conservadora

O site **só se oferece a buscadores quando está pronto para publicar**. A regra vale para o
`robots.txt` e para a meta `robots` de toda página:

| `NEXT_PUBLIC_SITE_URL` | `SITE_PUBLICACAO` | Resultado |
|---|---|---|
| ausente | qualquer | `Disallow: /` + `noindex, nofollow` |
| definido | ausente | `Disallow: /` + `noindex, nofollow` |
| definido | `1` | indexável, com sitemap e canonical no domínio |

Enquanto houver bloqueador humano aberto, o correto é deixar assim: política e termos são versões
de trabalho, e um resultado de busca permanente para eles — ainda por cima sob uma URL temporária
— é difícil de desfazer.

Num deploy de revisão sem domínio próprio, o canonical usa a URL de produção da Vercel em vez de
`localhost`. Uma URL `*.vercel.app` **não** conta como domínio definitivo: o bloqueador `dominio`
continua aberto e a indexação continua fechada.

### Quando o domínio existir

Defina as duas variáveis no projeto da Vercel (Settings → Environment Variables) e refaça o deploy:

```text
NEXT_PUBLIC_SITE_URL = https://seu-dominio
SITE_PUBLICACAO      = 1
```

`SITE_PUBLICACAO=1` também faz `npm run check:content` reprovar o build enquanto restar qualquer
bloqueador humano — é a mesma chave, de propósito: o site não fica indexável antes de estar pronto.

## Antes de publicar

O site é público e navegável, mas **os documentos legais são versões de trabalho**: eles dependem
de decisões que só o titular pode tomar. Onde falta informação, a página mostra um bloco
`Em definição` que nomeia o que está pendente — nunca um valor estimado nem um campo entre
colchetes.

```powershell
npm run check:content                              # lista o que está em aberto
$env:SITE_PUBLICACAO="1"; npm run check:content    # falha enquanto houver bloqueador
```

Antes do deploy, defina o domínio:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://seu-dominio"
```

Sem essa variável, `canonical`, `sitemap.xml` e Open Graph caem em `localhost`.

A lista completa de pendências, com o mapa de onde cada uma aparece na interface, está em
[`docs/DECISOES_ANTES_DE_PUBLICAR.md`](docs/DECISOES_ANTES_DE_PUBLICAR.md).

## Arquitetura

```text
src/
  app/                 rotas (App Router), sitemap, robots, manifest, 404 e erro
  components/
    brand/             logo viva BLAJEEN: olhos, piscada e gosma
    layout/            hero, seções, rodapé, skip link
    legal/             renderizador dos documentos e o bloco "Em definição"
    motion/            provedor de movimento, abertura, revelação por scroll
    navigation/        header flutuante e gaveta principal
    overlays/          primitiva de gaveta acessível
    projects/          banners, showcases, gaveta de prévia e página de produto
  content/             todo o texto e os dados, tipados; nada de CMS
  lib/                 rotas, metadados e schema
  assets/fonts/        Inter e JetBrains Mono, com as licenças OFL
public/
  brand/               assinatura simples, usada apenas sobre os banners
  projects/            os dois banners finais aprovados (masters PNG)
  og/                  derivados 1200×630 gerados por `npm run build:assets`
tools/                 geração de assets e scripts de QA
docs/                  plano mestre, copy, requisitos legais e bloqueadores
```

Server Components por padrão. Client Components apenas onde há interação real: marca viva, header,
gavetas, controle de movimento e revelação por scroll. Sem CMS, analytics, pixels, cookies não
essenciais ou formulário com backend.

As páginas jurídicas e de suporte funcionam sem JavaScript — `npm run qa:shots` verifica isso a
cada execução.

## Fonte de verdade

Leia nesta ordem antes de alterar qualquer coisa:

1. [`CLAUDE.md`](CLAUDE.md)
2. [`docs/PLANO_MESTRE_DO_SITE.md`](docs/PLANO_MESTRE_DO_SITE.md)
3. [`docs/COPY_FINAL_DO_SITE.md`](docs/COPY_FINAL_DO_SITE.md)
4. [`docs/LEGAL_LOJAS_E_DADOS.md`](docs/LEGAL_LOJAS_E_DADOS.md)
5. [`docs/DECISOES_ANTES_DE_PUBLICAR.md`](docs/DECISOES_ANTES_DE_PUBLICAR.md)
6. [`docs/ASSETS_APROVADOS.md`](docs/ASSETS_APROVADOS.md)

`C:\dev\revalio`, `C:\dev\docalio` e `C:\dev\gramelio` são fontes externas de verdade, somente
leitura. Nenhuma afirmação sobre coleta de dados, recursos ou plataformas pode ser publicada sem
evidência nesses repositórios. Em 19/08/2026, `C:\dev\gramelio` continha apenas arte — por isso o
Gramelio aparece no site com desenho, e não com recursos.

## Protótipo original

`index.html`, `styles.css`, `script.js` e `favicon.svg` na raiz são o protótipo estático que
originou a identidade. Ficam preservados como referência e não fazem parte do build. Para vê-lo:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```
