This is under active development!

# Running the webserver

- `npm install`
- `npm start`
- Go to `http://localhost:4000/`

# Routes
- `/`: welcome page. create games
- `/admin`: admin page. upload puzzles (json format)
- `/game/:gid`: game page. link to friends and play

# Converting .puz to .json
- e.g. run the bash script `./convert.py puzzles/puz/Apr0117.puz`, and paste the output in /admin
- acquire .puz files online. Some free ones can be found [here](http://crosswordfiend.com/download/)

Hosted [here](http://crosswords.stevenhao.com)
