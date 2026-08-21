CREATE TABLE IF NOT EXISTS onboarding_projects (
  id uuid PRIMARY KEY,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  company_name text NOT NULL,
  project_type text NOT NULL CHECK (project_type IN ('ECOMMERCE', 'BARBERSHOP', 'PERSONAL_TRAINER', 'BEAUTY_STUDIO')),
  status text NOT NULL CHECK (status IN ('WAITING_FOR_CUSTOMER', 'IN_PROGRESS', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'IMPLEMENTING', 'PUBLISHED', 'ARCHIVED')),
  token_hash char(64) NOT NULL UNIQUE,
  token_encrypted text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  token_revoked_at timestamptz,
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  current_step integer NOT NULL DEFAULT 0 CHECK (current_step >= 0),
  assigned_to text,
  source_order_id text,
  source_order_item_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  schema_version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS onboarding_projects_status_idx ON onboarding_projects(status);
CREATE INDEX IF NOT EXISTS onboarding_projects_type_idx ON onboarding_projects(project_type);
CREATE INDEX IF NOT EXISTS onboarding_projects_updated_idx ON onboarding_projects(updated_at DESC);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS onboarding_answers (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES onboarding_projects(id) ON DELETE CASCADE,
  section text NOT NULL,
  field text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, section, field)
);

CREATE INDEX IF NOT EXISTS onboarding_answers_project_idx ON onboarding_answers(project_id);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS onboarding_assets (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES onboarding_projects(id) ON DELETE CASCADE,
  slot text NOT NULL,
  original_name text NOT NULL,
  storage_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  size bigint NOT NULL CHECK (size > 0),
  width integer,
  height integer,
  alt_text text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  consent_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS onboarding_assets_project_idx ON onboarding_assets(project_id, slot, sort_order);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS onboarding_reviews (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES onboarding_projects(id) ON DELETE CASCADE,
  section text NOT NULL,
  field text,
  message text NOT NULL,
  status text NOT NULL CHECK (status IN ('OPEN', 'RESOLVED')),
  author text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS onboarding_reviews_project_idx ON onboarding_reviews(project_id, status);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS onboarding_events (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES onboarding_projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  actor text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS onboarding_events_project_idx ON onboarding_events(project_id, created_at DESC);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS onboarding_rate_limits (
  key_hash char(64) NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 1,
  PRIMARY KEY (key_hash, window_start)
);

CREATE INDEX IF NOT EXISTS onboarding_rate_limits_window_idx ON onboarding_rate_limits(window_start);

