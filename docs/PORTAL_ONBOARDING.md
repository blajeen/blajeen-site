# Portal de onboarding da Blajeen Labs

O portal recebe os textos, dados operacionais e arquivos necessários para personalizar os quatro
produtos comerciais: E-commerce, Barbearia, Personal Trainer / Studio e Estética / Beauty Studio.
Ele faz parte do mesmo app Next.js, mas as páginas do cliente e do painel não entram no sitemap e
são marcadas para não serem indexadas.

## Arquitetura adotada

- **Aplicação:** Next.js App Router e TypeScript estrito, seguindo o site existente.
- **Banco de produção:** PostgreSQL/Neon por `DATABASE_URL`.
- **Banco no desenvolvimento:** arquivo `.data/onboarding.json`, somente para facilitar o trabalho
  local quando não há `DATABASE_URL`. Produção recusa iniciar o portal sem banco durável.
- **Arquivos de produção:** PostgreSQL/Neon por padrão; Vercel Blob continua disponível como opção quando `BLOB_READ_WRITE_TOKEN` estiver configurado.
- **Arquivos no desenvolvimento:** `.data/uploads/`. Produção recusa uploads sem Blob configurado.
- **Administração:** uma senha interna configurada no ambiente e sessão assinada, HttpOnly,
  Secure em produção e SameSite Strict. O repositório não tinha autenticação ou RBAC para reutilizar.
- **Cliente:** link aleatório de 256 bits, sem conta e sem ID interno. O banco guarda o hash; a
  cópia exibida ao administrador fica criptografada para permitir copiar o link.

## Variáveis

Copie `.env.example` para `.env.local` e preencha:

- `DATABASE_URL`: conexão PostgreSQL do Neon.
- `ONBOARDING_SESSION_SECRET`: segredo longo e aleatório usado em sessões e criptografia de tokens.
- `ONBOARDING_ADMIN_PASSWORD`: senha do painel interno.
- `BLOB_READ_WRITE_TOKEN`: token opcional do Vercel Blob; sem ele, o portal usa o Neon.
- `ONBOARDING_TOKEN_TTL_DAYS`: validade padrão do link, em dias; o padrão é 30.
- `NEXT_PUBLIC_SITE_URL`: origem usada na geração dos links.

Nenhum valor real deve ser incluído no Git.

## Migration

`migrations/001_onboarding_portal.sql` cria projetos, respostas consultáveis, arquivos, revisões,
eventos de auditoria e a base para rate limiting. `002_database_asset_storage.sql` adiciona o
armazenamento privado dos arquivos no Neon. Aplique em cada ambiente com `npm run db:migrate`.
O executor registra checksum e se recusa a reaplicar uma migration que foi alterada.

## Rotas

- `/onboarding/[token]`: formulário do cliente, retomada e revisão final.
- `/admin/login`: acesso da equipe.
- `/admin/onboardings`: lista, filtros e criação manual.
- `/admin/onboardings/[id]`: respostas, arquivos, correções, aprovação, histórico e exportação.

As APIs vivem sob `/api/onboarding/*` e `/api/admin/onboardings/*`. Toda mutação valida novamente
token ou sessão no servidor. Depois do envio, o cliente não pode editar; em uma solicitação de
correção, somente as seções ou campos marcados ficam liberados.

## Arquivos

São aceitos PNG, JPEG, WEBP, SVG sanitizado, PDF, CSV e XLSX, com limite de 4 MB. O servidor valida
assinatura real e extensão, recusa executáveis e conteúdo ativo em SVG e lê dimensões conhecidas.
Os bytes ficam privados no Neon (ou no Blob opcional), organizados por projeto e entregues por uma
rota autorizada, sem expor credenciais.

## Compra futura

O site ainda não possui checkout. A função `createOnboardingAfterPurchase` em
`src/lib/onboarding/purchase-integration.ts` é o ponto pronto para o futuro webhook. Ela recebe
pedido, item, produto e cliente, e usa o ID do item como chave idempotente: repetir a confirmação
de pagamento retorna o onboarding existente em vez de criar outro.

Não há envio real de e-mail no repositório atual. A criação devolve o link para cópia manual; quando
um provedor de e-mail for adotado, o webhook poderá enviar esse mesmo link depois da confirmação.

## Exportação

Depois da aprovação, o painel baixa um JSON com `schemaVersion: 1`, blocos comuns, dados específicos
do produto e manifesto de imagens. Os quatro adaptadores compartilham o contrato, mas separam suas
seções específicas. A exportação não escreve nos bancos dos produtos: essa ação continuará exigindo
aprovação explícita em uma futura integração.

## Privacidade e operação

A política pública foi atualizada para descrever os dados do onboarding e seus fornecedores. O
prazo de retenção após entrega ainda depende de decisão do titular e aparece como bloqueador humano.
Antes de ativar o portal para clientes reais, confirme esse prazo, revise juridicamente os textos e
configure banco, segredo e senha em produção.
