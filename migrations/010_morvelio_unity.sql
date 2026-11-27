-- Telemetria dos saves do Morvelio (Unity Cloud Save). Sem ids nem nomes: hash sha256 do id e um resumo anônimo por conta.
CREATE TABLE IF NOT EXISTS morvelio_unity_accounts (
  hash text PRIMARY KEY,
  created_at bigint NOT NULL,
  last_login_at bigint NOT NULL,
  linked boolean NOT NULL,
  summary jsonb,
  read_at bigint,
  read_login_at bigint
);
CREATE TABLE IF NOT EXISTS morvelio_unity_snapshots (
  taken_at timestamptz PRIMARY KEY,
  payload jsonb NOT NULL
);
