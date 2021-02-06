-- psql < add_times_solved_1_24_21.sql
UPDATE PUBLIC.PUZZLES
SET is_public = False
WHERE pid = 'CHANGEME'
