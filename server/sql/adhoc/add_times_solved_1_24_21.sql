-- psql < add_times_solved_1_24_21.sql
ALTER TABLE PUBLIC.PUZZLES
ADD times_solved numeric DEFAULT 0 CHECK (times_solved >= 0);
