#!/bin/sh

# This script is intended for use when you are locally standing up a postgres instance to test the backend
# it simply creates all of the relevant dbs in the provided param

echo "creating dbs in ${1}"

psql -a "${1}" < sql/create_game_events.sql
psql -a "${1}" < sql/create_puzzles.sql
psql -a "${1}" < sql/create_room_events.sql
psql -a "${1}" < sql/create_puzzle_solves.sql
psql -a "${1}" < sql/create_id_counters.sql