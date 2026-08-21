CREATE TABLE IF NOT EXISTS onboarding_asset_files (
  storage_key text PRIMARY KEY,
  content bytea NOT NULL CHECK (octet_length(content) <= 4194304),
  created_at timestamptz NOT NULL DEFAULT now()
);

