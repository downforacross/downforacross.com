## Server architecture

### Main website

- Prod: statically hosted via `serve`, host = downforacross.com
- Dev: localhost:3020

### http server (host = downforacross.com)

- Prod: Hosts are both api.foracross.com/
- Staging: Hosted at api-staging.foracross.com, or `localhost:3021` if running `yarn devbackend` locally.

### websocket server

- Prod: TBD, probably downforacross.com/ws??, probably a separate process
- Dev: localhost:3020 (using [CRA proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/))
- Responsibilities

  - MVP: Handle pub/sub for game events

## client config

- Production build has `SERVER_URL = "https://api.foracross.com"`
  - This is `yarn build`, used by vercel for both production and preview deployments
- Development build (e.g. `yarn start`) has `SERVER_URL = "https://api-staging.foracross.com"`.
  - This is `yarn start`
- Development with `process.env.REACT_APP_USE_LOCAL_SERVER=1` has `SERVER_URL = localhost:3021`
  - This is `yarn devfrontend`

### Database

All game events are stored in postgres
Postgres schemas:

```
CREATE DATABASE dfac;
\c dfac;
CREATE TABLE game_events(
  gid text,
  uid text,
  ts timestamp without time zone,
  event_type text,
  event_payload json
);
```

### Getting Started

Important: If you aren't making changes to `server/server.js`, you don't need to run the backend locally. In this case, just run `yarn start`.

#### Run your local db

1. Install postgres
   (mac) `brew install postgresql`
2. Run postgres
   (mac) `brew services start postgresql`

#### Initialize your local db:

1. Create the database

```
psql -c 'create database dfac'
```

(`createdb` if this fails)

2. Create the tables

```
./create_fresh_dbs.sh
```

Or if you want to do it manually, run the sql in sql/ like

```
psql dfac < create_game_events.sql
```

#### Run your local websocket server

`yarn devbackend`

This command expects you to have PGDATABASE, PGUSER, and PGPASSWORD env vars set and a postgres server running. See `.envrc.template`.  
Copy and rename `.envrc.template` to `.envrc` to set these variables (make sure to have [DirEnv](https://direnv.net/) installed).  
This will run a backend server on `localhost:3021`

#### Run your local frontend server

`yarn devfrontend`

This will run a frontend server on localhost:3020, that talks to your server on `localhost:3021`.

#### Test manually

1. Create a game by clicking a puzzle in the homepage `localhost:3020/`
2. You should start seeing a stream of events in your backend process's logs
3. You can also introspect the database manually (e.g. using psql or pgadmin)
