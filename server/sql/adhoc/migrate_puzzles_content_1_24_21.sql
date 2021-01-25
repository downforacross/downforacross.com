-- see https://github.com/downforacross/downforacross.com/pull/148#discussion_r563510048
-- **invocation**: psql < migrate_puzzles_content_1_24_21.sql
ALTER TABLE PUBLIC.PUZZLES
  ALTER COLUMN content
  SET DATA TYPE jsonb
  USING content::jsonb;