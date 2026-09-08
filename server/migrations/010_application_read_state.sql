-- ============================================================
-- 010_application_read_state.sql
-- Adds a read flag to job applications so they can appear in the
-- admin notification bell alongside contact submissions.
--
-- Existing applications are marked read, so enabling this feature
-- does not surface a backlog of old notifications.
-- ============================================================

ALTER TABLE job_applications
  ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE job_applications SET is_read = TRUE;

CREATE INDEX idx_job_applications_unread ON job_applications(is_read);