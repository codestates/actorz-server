const express = require('express');
const cors = require('cors');

const PORT = 3001;
const app = express();

app.use(express.json());
app.use(cors());

app.get('/api', (req, res) => {
  res.send('Hello Actorz :)');
});

const server = app.listen(PORT, () => {
  console.log(`http server, used port ${PORT}`)
})

module.exports = server;