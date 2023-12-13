![Downforacross Logo](assets/image.png)

[![built with Codeium](https://codeium.com/badges/main)](https://codeium.com/?repo_name=downforacross/downforacross.com
)

## downforacross 

Downforacross is an online website for sharing crosswords and playing collaboratively with friends in real time.

It is hosted at https://downforacross.com/.

## Contributing

If you notice a bug or have a feature request, feel free to open an issue.

### Getting Started

1. Install `nvm` and `yarn`

2. Clone repo and cd to repo root.

   `git clone https://github.com/downforacross/downforacross.com.git`
   `cd downforacross.com`

3. Use node v18
   `nvm install`
   `nvm use`
   `nvm alias default 18` (optional)

4. Install Dependencies
   `yarn`

### Running with Docker

To run Downforacross with Docker, you will need to build the Docker image and start the services. Here's how to do it:

1. Build the Docker image:
   `docker build -t downforacross .`

2. Start the services:
   `docker-compose up`
   This will start both the application and the database services.

~~3. Run frontend server
   `yarn start`~~

   After starting the services with `docker-compose up`, the application's frontend and server will be running in their respective containers. You do not need to start them separately.

4. Run the server:
   `docker exec -it <container_id> yarn start`

   Replace `<container_id>` with the ID of the Docker container where the application is running.

   This command will automatically run the frontend server as part of the Docker container's startup process. There is no need to manually run `yarn start` for the frontend. You can access the application on your local machine at:

   `http://localhost:3000/`

### Contributing

Down for a Cross is open to contributions from developers of any level or experience.
See the `Getting Started` section for instructions on setting up.

Join the [discord](https://discord.gg/KjPHFw8) for discussion.

### Tips

Developing for mobile web:

- Mobile device emulator: https://appetize.io/demo?device=nexus7&scale=50&orientation=portrait&osVersion=9.0
- Public urls for local server: ngrok, https://ngrok.com/
- Remote debugging (e.g. safari developer mode) tips: https://support.brightcove.com/debugging-mobile-devices

### Other resources

- https://firebase.google.com/docs/database/web/start (intro to firebase realtime database)
- https://reactjs.org/tutorial/tutorial.html (intro to react)
- https://www.messenger.com/t/steven.hao.14 (helpline)

##### Running Tests with Docker

To run the application's tests within the Docker environment, you can use the following command:

   `docker-compose exec app yarn test`

This command will execute tests in the application's container. Ensure that the Docker container for the application is running before executing this command.

##### Configuration

The Docker setup can be configured using environment variables in your `docker-compose.yml` file. Here's an example snippet to set the environment variables for the database:

```yaml
services:
  db:
    environment:
      POSTGRES_DB: downforacross_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
```

Adjust the `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` to match your local setup. Additional environment variables can be added as needed for further configuration.
- https://discord.gg/KjPHFw8 (community discord)
