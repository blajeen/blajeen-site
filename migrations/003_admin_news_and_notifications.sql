CREATE TABLE IF NOT EXISTS admin_news_posts (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  publish_date date NOT NULL,
  label text NOT NULL,
  title text NOT NULL,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  href text,
  cta text,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_news_posts_publication_idx
  ON admin_news_posts(status, publish_date DESC);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS onboarding_email_deliveries (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES onboarding_projects(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  provider_message_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS onboarding_email_deliveries_project_idx
  ON onboarding_email_deliveries(project_id, created_at DESC);
