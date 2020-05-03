## Server architecture

### Main website

- Prod: statically hosted via `serve`, host = downforacross.com
- Dev: localhost:3020

### http server (host = downforacross.com)

- Prod: TBD, probably downforacross.com/api??, probably a separate process
- Dev: localhost:3020 (using [CRA proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/))

### websocket server

- Prod: TBD, probably downforacross.com/ws??, probably a separate process
- Dev: localhost:3020 (using [CRA proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/))
- Responsibilities
  - MVP: Handle pub/sub for game events

### database

- Prod: TBD
- Dev: local redis instance
