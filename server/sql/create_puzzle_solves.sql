-- psql < create_puzzle_solves.sql

CREATE TABLE
    IF NOT EXISTS puzzle_solves
(
    -- only allow a puzzle solve to be recorded if the puzzle exists, and when a puzzle is deleted, also delete the solves
    pid text NOT NULL REFERENCES puzzles ON DELETE CASCADE,
    gid text NOT NULL,
    solved_time timestamp without time zone, -- the time the solve was recorded
    time_taken_to_solve integer CHECK (time_taken_to_solve > 0), -- the duration (seconds) of how long it took to solve

    constraint only_one_solve_per_puzzle_and_game UNIQUE(pid,gid)
);

ALTER TABLE public.puzzle_solves
    OWNER to dfacadmin;

GRANT ALL ON TABLE public.puzzle_solves TO dfacadmin;