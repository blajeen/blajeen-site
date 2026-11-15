CREATE TABLE IF NOT EXISTS morvelio_reviews (
  store text NOT NULL,
  id text NOT NULL,
  payload jsonb NOT NULL,
  review_at timestamptz NOT NULL,
  PRIMARY KEY (store, id)
);
CREATE INDEX IF NOT EXISTS morvelio_reviews_date ON morvelio_reviews (review_at);
CREATE TABLE IF NOT EXISTS morvelio_daily_emails (
  day date PRIMARY KEY,
  state text NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
