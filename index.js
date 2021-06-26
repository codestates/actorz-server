const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const mongodbUrl = 'mongodb://localhost:27017/actorz';
const mongodbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}
mongoose.connect(mongodbUrl, mongodbConfig, (err) => {
  if(err) return console.log(err);
  console.log('successfully connect')
})

const PORT = 3001;
const app = express();


app.use(express.json());
app.use(cors());

app.post('/api', (req, res) => {
  res.send('hi')
});

const server = app.listen(PORT, () => {
  console.log(`http server, used port ${PORT}`)
})

module.exports = server;