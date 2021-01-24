-- invocation: psql < sanitize_puzzles_1_24_21.sql
UPDATE PUBLIC.PUZZLES
SET content = regexp_replace(content::text, '\\u0000', '', 'g')::json;

-- SELECT regexp_replace(content::text, '\\u0000', '', 'g'))::json from puzzles limit 50


-- TESTING:
-- test against the query from model/puzzle.ts that was failing:

-- **error**:
-- "unsupported Unicode escape sequence"

-- **query for reproduction**:
-- SELECT pid, uploaded_at, content, 
-- regexp_replace(content::text, '\\u0000', '', 'g')::json as rg
-- FROM puzzles
-- WHERE is_public = true
-- AND (content->'info'->>'type') = ANY('{Mini Puzzle, Daily Puzzle}')
-- AND ((content -> 'info' ->> 'title') || (content->'info'->>'author')) ILIKE ALL('{%%}')
-- ORDER BY pid DESC 
-- LIMIT 50
-- OFFSET 0;
