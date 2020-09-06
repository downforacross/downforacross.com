-- psql dfac < create_game_events.sql
CREATE TABLE
IF NOT EXISTS game_events
(
  gid text,
  uid text,
  ts timestamp without time zone,
  event_type text,
  event_payload json
);
