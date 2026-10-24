CREATE TABLE IF NOT EXISTS social_accounts (
  id text PRIMARY KEY,
  body jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS social_assets (
  id uuid PRIMARY KEY,
  body jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY,
  body jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS social_deliveries (
  id uuid PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES social_posts(id),
  state text NOT NULL DEFAULT 'pendente',
  body jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_deliveries_post_idx ON social_deliveries(post_id);
CREATE TABLE IF NOT EXISTS social_oauth (
  id text PRIMARY KEY,
  body jsonb NOT NULL,
  expires_at timestamptz NOT NULL
);
