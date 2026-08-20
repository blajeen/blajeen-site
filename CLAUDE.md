# Diretrizes obrigatórias do projeto Blajeen Labs

Este repositório contém o site institucional da Blajeen Labs e as páginas públicas necessárias
para Revalio, Docalio e Gramelio. Antes de alterar código, leia integralmente, nesta ordem:

1. `docs/PLANO_MESTRE_DO_SITE.md`;
2. `docs/COPY_FINAL_DO_SITE.md`;
3. `docs/LEGAL_LOJAS_E_DADOS.md`;
4. `docs/DECISOES_ANTES_DE_PUBLICAR.md`.

## Regras de produto

- Preserve o conceito já criado para o site: laboratório vivo e premium, wordmark `BLAJEEN` com os
  dois `E` funcionando como olhos animados, base quase preta, off-white e verde ácido como sinal.
- A assinatura simples `BLAJEEN LABS` sem olhos é uma exceção para aplicação sobre os banners dos
  jogos; ela não substitui a logo viva no hero, header ou identidade institucional do site.
- A logo viva do hero possui gosma verde-ácido aderida à base das letras, com poucos pingos e
  movimento viscoso discreto. Não aplicar gosma na assinatura simples dos banners.
- O site deve parecer um produto digital premium e autoral: composição editorial, espaço negativo,
  superfícies profundas, bordas precisas e movimento contido. Evite neon excessivo, cards SaaS,
  glassmorphism genérico, gradientes saturados e aparência de template.
- O site é de um **estúdio indie que cria produtos próprios**. Nunca o apresente como agência,
  consultoria, software house, SaaS ou empresa grande.
- Revalio, Docalio e Gramelio são os projetos reais do estúdio, nessa ordem de experimento. Remova
  do protótipo os experimentos fictícios `Oracle Without a Name`, `The Last Signal` e
  `Synthetic Memory` quando a implementação final começar.
- Todo jogo novo nasce com cinco rotas — `/projects/<jogo>`, `/<jogo>/support`, `/<jogo>/privacy`,
  `/<jogo>/terms` e `/<jogo>/delete-account` — e com um item no rodapé, na gaveta e no sitemap.
  Produto no site sem infraestrutura pública correspondente não entra.
- Não invente usuários, downloads, equipe, clientes, parceiros, investimento, prêmios, datas de
  lançamento, depoimentos, métricas ou funcionalidades não implementadas.
- Revalio tem código e documentação técnica em `C:\dev\revalio`; use-os somente como fonte de
  verdade. Não mova nem altere esse app como parte do site sem autorização explícita.
- Docalio está em concepção. Todo texto deve usar linguagem de desenvolvimento/conceito, nunca
  fingir que já existe um build jogável ou uma data de lançamento.
- Gramelio está mais cedo ainda: em `C:\dev\gramelio` existe apenas arte. O jogo é casual, não é
  médico, e sua descrição é **desenho**, não recurso pronto — ela vive em `pilares`, nunca em
  `recursos`. Não citar número de fases, mundos, moedas, preço, plataforma, data ou campanha
  futura como confirmada, mesmo quando a arte do banner citar.

## Regras legais e de loja

- Nenhuma política pode prometer comportamento diferente do build efetivamente publicado.
- Campos entre colchetes são bloqueadores humanos. Não os exiba no site de produção.
- Antes de publicar, audite SDKs, permissões, tráfego de rede, consoles e retenção de dados de cada
  app. A matriz em `docs/LEGAL_LOJAS_E_DADOS.md` é um ponto de partida, não uma declaração eterna.
- Conta criada no app exige exclusão iniciada dentro do app. No Google Play, também é necessária
  uma página web pública de exclusão. Não esconda a ação dentro da política de privacidade.
- Revalio e Docalio são educação/entretenimento; não diagnosticar, prescrever, receber dados reais
  de pacientes nem se apresentar como dispositivo médico. Gramelio é entretenimento e não usa o
  aviso médico — o aviso dele é não parecer um aplicativo já distribuído.
- Canal de contato só entra no site depois de criado e confirmado. Deduzir o endereço de um produto
  a partir do padrão dos outros publica um canal que ninguém lê, e as lojas verificam.
- Não publicar textos jurídicos sem preencher os dados do controlador e obter revisão do titular.

## Qualidade mínima

- TypeScript estrito, componentes semânticos, navegação por teclado e foco visível.
- Experiência mobile desenhada, não apenas reduzida.
- Navegação principal em drawer moderna e acessível, com foco preso enquanto aberta, fechamento por
  `Esc`, retorno do foco ao acionador e bloqueio do scroll do fundo.
- Gavetas de projeto servem para prévia e descoberta; nunca podem ser o único caminho para conteúdo,
  suporte, política, termos ou exclusão de dados.
- Usar obrigatoriamente os banners finais definidos em `docs/ASSETS_APROVADOS.md`, sem cortar os
  títulos dos jogos nem a assinatura Blajeen Labs. As artes não têm todas a mesma proporção; a
  medida correta de cada uma está naquele documento e no QA visual.
- `prefers-reduced-motion`, botão para pausar movimentos e ausência de efeitos essenciais à
  compreensão.
- Sem autoplay com áudio. Sem cursor customizado que elimine o cursor nativo.
- Meta de Lighthouse em produção: Performance, Accessibility, Best Practices e SEO >= 90.
- Sem analytics, pixels, cookies não essenciais ou formulário com backend na primeira publicação.
  Se forem adicionados, atualizar política, consentimento e declarações das lojas antes do deploy.
- Fontes devem ser auto-hospedadas no build final; remover dependência de Google Fonts do protótipo.
- Todo link jurídico deve responder em HTTPS, sem login, inclusive em tela pequena.
