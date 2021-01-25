-- psql < create_puzzles.sql
CREATE TABLE
IF NOT EXISTS puzzles
(
  uid text,

  -- properties managed by dfac
  pid text PRIMARY KEY,
  is_public boolean,
  uploaded_at timestamp without time zone,

  -- static properties of the puzzle
  content jsonb
);

ALTER TABLE public.puzzles
    OWNER to dfacadmin;

-- GRANT ALL ON TABLE public.puzzles TO dfac_staging;
GRANT ALL ON TABLE public.puzzles TO dfacadmin;
