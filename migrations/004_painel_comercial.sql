-- Painel comercial: pedidos do "Crie seu projeto", contratos e ajustes do catálogo.

CREATE TABLE IF NOT EXISTS admin_project_requests (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  kind text NOT NULL,
  idea text NOT NULL,
  status text NOT NULL DEFAULT 'NOVO' CHECK (status IN ('NOVO', 'EM_CONVERSA', 'PROPOSTA', 'FECHADO', 'PERDIDO')),
  notes text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'crie-seu-projeto',
  email_status text NOT NULL DEFAULT 'PENDING' CHECK (email_status IN ('PENDING', 'SENT', 'FAILED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_project_requests_created_idx ON admin_project_requests(created_at DESC);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS admin_contracts (
  id uuid PRIMARY KEY,
  number text NOT NULL UNIQUE,
  service text NOT NULL CHECK (service IN ('site', 'sistema', 'video', 'jogo', 'projeto')),
  status text NOT NULL DEFAULT 'AGUARDANDO_CLIENTE' CHECK (status IN ('AGUARDANDO_CLIENTE', 'PREENCHIDO', 'ASSINADO', 'CANCELADO')),
  terms jsonb NOT NULL DEFAULT '{}'::jsonb,
  client jsonb NOT NULL DEFAULT '{}'::jsonb,
  token_hash text NOT NULL UNIQUE,
  token_encrypted text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  request_id uuid REFERENCES admin_project_requests(id) ON DELETE SET NULL,
  client_submitted_at timestamptz,
  signed_at timestamptz,
  deposit_received_at timestamptz,
  balance_received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_contracts_created_idx ON admin_contracts(created_at DESC);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
