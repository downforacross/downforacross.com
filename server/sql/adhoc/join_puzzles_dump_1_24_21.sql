-- ***invocation***
-- psql < join_puzzles_dump_1_24_21.sql

INSERT INTO PUBLIC.PUZZLES 
    (uid, pid, is_public, uploaded_at, content)
SELECT
   a.uid, a.pid, a.is_public, a.uploaded_at, a.content
FROM PUBLIC.PUZZLE_DUMP a LEFT JOIN PUBLIC.PUZZLES b 
ON a.pid = b.pid
WHERE b.pid is null;