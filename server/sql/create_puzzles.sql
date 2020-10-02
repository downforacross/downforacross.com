-- psql < create_puzzles.sql
CREATE TABLE
IF NOT EXISTS puzzles
(
  uid text,

  -- properties managed by dfac
  pid text PRIMARY KEY,
  is_public boolean,
  num_solves integer,
  uploaded_at timestamp without time zone,
  updated_at timestamp without time zone,

  -- static properties of the puzzle
  puzzle_type text,
  title text,
  author text,
  num_rows integer,
  num_cols integer,
  metadata json,
  content json
);

ALTER TABLE public.puzzles
    OWNER to dfacadmin;

-- GRANT ALL ON TABLE public.puzzles TO dfac_staging;
GRANT ALL ON TABLE public.puzzles TO dfacadmin;
