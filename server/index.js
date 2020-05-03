const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/test', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Listening on port ${port}`));
