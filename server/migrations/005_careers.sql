-- ============================================================
-- 005_careers.sql
-- Job postings + applications for the Careers page
-- ============================================================

CREATE TABLE job_postings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    qualifications  TEXT[] DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_postings_slug ON job_postings(slug);
CREATE INDEX idx_job_postings_active ON job_postings(is_active);

CREATE TRIGGER trg_job_postings_updated_at BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE job_applications (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id   UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    applicant_name   VARCHAR(150) NOT NULL,
    applicant_email  VARCHAR(255) NOT NULL,
    resume_url       TEXT NOT NULL,
    cover_letter     TEXT,
    submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_applications_posting ON job_applications(job_posting_id);