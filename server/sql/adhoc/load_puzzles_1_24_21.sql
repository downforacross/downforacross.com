-- Load puzzles from a csv dump.
-- see backfills/dumpPuzzles.js for how to create such a csv dump.
COPY PUBLIC.PUZZLES(uid, pid, is_public, uploaded_at, content)
FROM STDIN
DELIMITER ','
CSV HEADER;