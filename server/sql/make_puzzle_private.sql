-- psql < make_puzzle_private.sql
UPDATE PUBLIC.PUZZLES
SET is_public = False
WHERE pid = '26999'
