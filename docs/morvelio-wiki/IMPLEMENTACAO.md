# Morvelio — implementação da página e da wiki

## Entrega

Implementação na branch `feat/morvelio-wiki`, em `C:/dev/blajeen-labs`.
Prévia local: <http://127.0.0.1:3018/morvelio/wiki>.
Apresentação do jogo: <http://127.0.0.1:3018/projects/morvelio>.
O domínio público ainda não foi atualizado. A prévia depende do servidor local em execução.

### Conteúdo

| Área | Fichas |
|---|---:|
| Classes | 7 |
| Habilidades e talentos | 133 |
| Itens e equipamentos | 120 |
| Receitas | 16 |
| Missões | 93 |
| Personagens | 19 |
| Criaturas e chefes | 87 |
| Regiões, acampamento e casa | 18 |
| Dungeons e alas do castelo | 20 |
| Reinos | 5 |
| Atlas do mundo | 1 |
| Guias | 8 |
| Crônicas | 7 |
| **Total** | **534** |

São 1.101 relações entre fichas e 154 imagens derivadas em WebP. O ícone da apresentação é Morvelio olhando o reino do alto da montanha, com o nome do jogo.

Os oito PDFs da pasta da Área de Trabalho foram verificados por SHA-256 contra as cópias do projeto. A importação usa os dados estruturados das mesmas edições e as diretrizes atuais do Desktop. Os nove broches substituem o equipamento antigo; personagens jogáveis são classes, com nome escolhido pelo jogador. Valores ausentes não foram inventados.

### Funcionalidades

- Busca sem distinção de acentos, por nome, efeito ou código de missão.
- Filtros combináveis, seleção múltipla, ordenação e paginação; consultas compartilháveis pela URL.
- Fichas com dados, fontes e relações para classes, receitas, NPCs, missões e lugares.
- Comparação de dois broches ou duas armas da mesma classe.
- Atlas do mundo, cinco reinos e plantas de regiões/dungeons, com zoom e acesso à imagem completa.
- Controle de spoilers aplicado no servidor: finais protegidos não são enviados no HTML padrão.
- Identificação de conteúdo documentado, planejado, mobile e saga literária.
- Conteúdo principal acessível sem JavaScript; navegação adaptada ao celular.
- Página do jogo renovada e wiki integrada aos menus, rodapé e sitemap.

## Manutenção

1. Atualizar primeiro as fontes canônicas e as cópias de consulta do Desktop.
2. Executar `python tools/morvelio-wiki/import.py --desktop "CAMINHO/Morvelio - Documentação" --game C:/dev/morvelio`.
3. Executar `node tools/morvelio-wiki/assets.mjs` para gerar imagens e registrar suas dimensões.
4. Revisar diferenças no JSON, relatório de importação e imagens; verificar conflitos editoriais.
5. Rodar lint, typecheck, testes e auditor de conteúdo.
6. Gerar build com `npx next build`. O `npm run build` também chama o prebuild de migração de onboarding; não usar uma validação editorial para executar migrações em produção.
7. Iniciar `npm run start -- --hostname 127.0.0.1 --port 3018` e rodar `node tools/morvelio-wiki/qa.mjs`.
8. Revisar a prévia antes de promover para o domínio e conferir as rotas após a publicação.

## Evidências e limites

- Manifesto das fontes: `FONTES_DESKTOP.json`.
- Contagens, reconciliações e omissões individuais: `RELATORIO_IMPORTACAO.json`.
- Verificações de navegador e capturas: pasta `qa/`.
- Os 117 testes automatizados do site passaram; lint e build de produção passaram.
- A verificação no build de produção passou: 534 fichas HTTP 200, 154 imagens WebP acessíveis, sitemap completo, rotas desconhecidas 404, busca, comparação, proteção de spoilers e leitura sem JavaScript.
- Cinco páginas foram verificadas em 360, 390, 768 e 1440 px: sem transbordamento horizontal da página, com um título principal e uma área principal. Há 20 capturas na pasta `qa/`. Uma falha de largura na capa mobile foi corrigida antes da entrega.
- O auditor de conteúdo mantém 19 pendências de publicação preexistentes do site; não foram encobertas nem resolvidas por esta alteração de Morvelio.
- Não foi atribuída nota de Lighthouse ou certificação de acessibilidade sem auditoria específica.
- Não há URL pública do aplicativo na App Store fornecida. Nenhum botão aponta para uma ficha inexistente. Os banners existentes não foram modificados nesta implementação.
- As plantas são propostas documentais, identificadas como tal; não representam prova de implantação no Unity.
- A edição da wiki não é versão do aplicativo. Habilidades, números e receitas exigem revisão quando o jogo mudar.
- Comentários, contas de leitores, builds comunitárias e cálculo de DPS ficam fora desta primeira entrega.
- Nenhum arquivo do jogo, PDF original, banco de produção ou arquivo alheio do Gramelio foi alterado.

## Publicação

O plano original exigia revisão de uma prévia antes da promoção ao domínio. Esta entrega implementa essa prévia e deixa as evidências organizadas. Não houve commit, push nem deploy em produção nesta etapa.
