-- psql < create_id_counters.sql

CREATE SEQUENCE IF NOT EXISTS gid_counter START 100000000;
CREATE SEQUENCE IF NOT EXISTS pid_counter START 100000000;

GRANT ALL ON SEQUENCE gid_counter TO dfacadmin;
GRANT ALL ON SEQUENCE pid_counter TO dfacadmin;