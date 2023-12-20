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

5. Run frontend server
   `yarn start`

### Contributing

Down for a Cross is open to contributions from developers of any level or experience.
See the `Getting Started` section for instructions on setting up.

Join the [discord](https://discord.gg/KjPHFw8) for discussion.

### Running with Docker

To build and run the Docker container for downforacross, follow these steps:

1. Build the Docker image:
   ```bash
docker build -t downforacross .
   ```
2. Run the Docker container:
   ```bash
docker run -p 3000:3000 downforacross
   ```

### Tips

Developing for mobile web:

- Mobile device emulator: https://appetize.io/demo?device=nexus7&scale=50&orientation=portrait&osVersion=9.0
- Public urls for local server: ngrok, https://ngrok.com/
- Remote debugging (e.g. safari developer mode) tips: https://support.brightcove.com/debugging-mobile-devices

### Other resources

- https://firebase.google.com/docs/database/web/start (intro to firebase realtime database)
- https://reactjs.org/tutorial/tutorial.html (intro to react)
- https://www.messenger.com/t/steven.hao.14 (helpline)
- https://discord.gg/KjPHFw8 (community discord)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=downforacross/downforacross.com&type=Date)](https://star-history.com/#downforacross/downforacross.com&Date)
