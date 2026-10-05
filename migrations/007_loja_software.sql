-- Loja: categoria Software, para os sistemas vendidos inteiros (código, site e marca).
--
-- A tabela nasceu (005) aceitando só as categorias dos exclusivos. Aqui sai a checagem antiga, seja
-- qual for o nome que o Postgres deu a ela, e entra a nova, com `software`. O bloco fica numa linha
-- só porque o `tools/migrate-onboarding.mjs` separa os comandos no ponto e vírgula do fim da linha.
-- Os produtos de software entram pelo código, na primeira leitura da loja (lote `loja:software` de
-- `garantirExemplos`, em `src/lib/loja/repositorio.ts`).

DO $$ DECLARE r record; BEGIN FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'store_products'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%category%' LOOP EXECUTE format('ALTER TABLE store_products DROP CONSTRAINT %I', r.conname); END LOOP; END $$;

-- statement-breakpoint
ALTER TABLE store_products ADD CONSTRAINT store_products_category_check
  CHECK (category IN ('software', 'colecionaveis', 'vestuario', 'casa', 'livros'));
