-- psql < create_puzzles.sql

CREATE TABLE public.room_events
(
    rid text COLLATE pg_catalog."default",
    uid text COLLATE pg_catalog."default",
    ts timestamp without time zone,
    event_type text COLLATE pg_catalog."default",
    event_payload json
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.room_events
    OWNER to dfacadmin;

-- GRANT ALL ON TABLE public.room_events TO dfac_production;

GRANT ALL ON TABLE public.room_events TO dfacadmin;
-- GRANT ALL ON TABLE public.room_events TO dfac_staging;
-- GRANT ALL ON TABLE public.room_events TO dfac_production;
-- Index: room_events_rid_ts_idx

-- DROP INDEX public.rame_events_rid_ts_idx;

CREATE INDEX rame_events_rid_ts_idx
    ON public.room_events USING btree
    (rid COLLATE pg_catalog."default" ASC NULLS LAST, ts ASC NULLS LAST)
    TABLESPACE pg_default;