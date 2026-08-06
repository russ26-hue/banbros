-- ============================================================
-- 009_qualifications_richtext.sql
-- Converts job_postings.qualifications from a text array to a
-- single rich-text (HTML) column, so admins can apply formatting.
--
-- Existing values are converted into an HTML bulleted list so no
-- current content is lost.
-- ============================================================
ALTER TABLE job_postings
ADD COLUMN qualifications_html TEXT;

-- Rebuild each existing array into <ul><li>...</li></ul>
UPDATE job_postings
SET
    qualifications_html = CASE
        WHEN qualifications IS NULL
        OR cardinality(qualifications) = 0 THEN NULL
        ELSE '<ul>' || (
            SELECT
                string_agg ('<li>' || item || '</li>', '')
            FROM
                unnest (qualifications) AS item
        ) || '</ul>'
    END;

ALTER TABLE job_postings
DROP COLUMN qualifications;

ALTER TABLE job_postings
RENAME COLUMN qualifications_html TO qualifications;