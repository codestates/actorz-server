require("dotenv").config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require("fs");
const https = require("https");

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

app.get("/api", (req, res) => {
  res.send("Hello Actorz :)");
});
app.post('/api', (req, res) => {
  res.send('hi')
});

let server;
if(process.env.NODE_ENV === "production"){
  app.use(cors({
    origin:["https://actorz.click", "https://www.actorz.click"],
    credentials:true,
    methods:["POST","GET","OPTIONS"]
  }));
  server = app.listen(PORT, () => {
    console.log(`http server, used port ${PORT}`)
  });
}else{
  app.use(cors({
    origin:["https://localhost:3000"], //3000 for react server?
    credentials:true,
    methods:["POST","GET","OPTIONS"]
  }));
  if(fs.existsSync("./key.pem")
     && fs.existsSync("./cert.pem")){
    const  privateKey = fs.readFileSync(__dirname + "/key.pem", "utf8");
    const certificate = fs.readFileSync(__dirname + "/cert.pem", "utf8");
    const credentials = { key: privateKey, cert: certificate };

    server = https.createServer(credentials, app);
    server.listen(PORT, () => console.log("server runnning"));
  }else{
    server = app.listen(PORT)
    console.log('not secured');
  }
}

module.exports = server;
