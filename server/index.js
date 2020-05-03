const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('a user connected');
});

app.get('/test', (req, res) => res.send('Hello World!'));

server.listen(port, () => console.log(`Listening on port ${port}`));
