-- psql < add_pid_numeric_solved_1_31_21.sql
ALTER TABLE PUBLIC.PUZZLES
ADD pid_numeric numeric DEFAULT null;
UPDATE PUBLIC.PUZZLES
SET pid_numeric = pid::numeric where pid ~ '^([0-9]+[.]?[0-9]*|[.][0-9]+)$';