-- Loja de exclusivos: produtos editados no painel, pedidos pagos pelo Asaas e frete do Melhor Envio.

CREATE TABLE IF NOT EXISTS store_products (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('colecionaveis', 'vestuario', 'casa', 'livros')),
  collection text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT 'EM_BREVE' CHECK (availability IN ('EM_BREVE', 'DISPONIVEL', 'SOB_ENCOMENDA', 'PRE_VENDA', 'ESGOTADO')),
  status text NOT NULL DEFAULT 'RASCUNHO' CHECK (status IN ('RASCUNHO', 'PUBLICADO')),
  option_label text NOT NULL DEFAULT '',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  shipping jsonb NOT NULL DEFAULT '{"pesoKg":0.5,"alturaCm":10,"larguraCm":15,"comprimentoCm":20}'::jsonb,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_products_listing_idx ON store_products(status, position, created_at);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS store_orders (
  id uuid PRIMARY KEY,
  number text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  cpf_cnpj text NOT NULL DEFAULT '',
  address jsonb,
  message text NOT NULL DEFAULT '',
  items jsonb NOT NULL,
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  shipping jsonb,
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  payment jsonb,
  status text NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO' CHECK (status IN ('AGUARDANDO_PAGAMENTO', 'PAGO', 'NOVO', 'EM_CONTATO', 'ENVIADO', 'CANCELADO', 'ESTORNADO')),
  notes text NOT NULL DEFAULT '',
  email_status text NOT NULL DEFAULT 'PENDING' CHECK (email_status IN ('PENDING', 'SENT', 'FAILED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_orders_created_idx ON store_orders(created_at DESC);

-- statement-breakpoint
-- Eventos do webhook do Asaas já tratados: ele entrega "pelo menos uma vez".
CREATE TABLE IF NOT EXISTS store_payment_events (
  id text PRIMARY KEY,
  event text NOT NULL,
  payment_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
