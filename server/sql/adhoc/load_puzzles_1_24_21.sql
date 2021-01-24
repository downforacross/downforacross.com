-- Load puzzles from a csv dump.
-- see backfills/dumpPuzzles.js for how to create such a csv dump.

-- ***example data***
-- uid,pid,is_public,uploaded_at,content
-- 1,1,false,2021-01-24T21:02:56.628Z,
-- 2,2,true,2021-01-24T21:02:56.628Z, 

-- ***invocation***
-- cat load_puzzles_1_24_21.sql data/puzzles.csv | psql

DROP TABLE IF EXISTS PUBLIC.PUZZLE_DUMP;
CREATE TABLE PUBLIC.PUZZLE_DUMP AS SELECT * FROM PUBLIC.PUZZLES LIMIT 0; 
COPY PUBLIC.PUZZLE_DUMP(uid, pid, is_public, uploaded_at, content)
FROM STDIN
DELIMITER ','
CSV HEADER;
