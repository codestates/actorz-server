require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const https = require("https");
const { mongodbUrl, mongodbConfig } = require("./config");


const { 
  user, 
  like, 
  post, 
  oauth, 
  portfolio,
  s3,
  search,
} = require("./controllers");

const PORT = 3001;
const app = express();
const corsOption = {
  origin: ["www.actorz.click", "actorz.click"],
  methods: ['GET', 'POST','OPTIONS'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 204
};

mongoose.connect(mongodbUrl, mongodbConfig, (err) => {
  if(err) return console.log(err);
  console.log("successfully connect")
});

app.use(express.json());
app.use(cors(corsOption));


app.get("/api", (req, res) => {
  res.send("Hello Actorz :)");
});
app.post("/api", (req, res) => {
  res.send("hi")
});

// ROUTER
// USER
app.post("/api/login", user.login);
app.post("/api/signup", user.signup);
app.post("/api/logout", user.logout);
app.post("/api/user/:user_id/delete", user.delete);
app.post("/api/user/:user_id/update", user.update);
app.get("/api/user/:user_id", user.info);

app.post("/api/login/google", oauth.googleLogin);
app.post("/api/login/kakao", oauth.kakaoLogin);

// LIKES
app.post("/api/post/:post_id/like", post.postLike);
app.post("/api/post/:post_id/unlike", post.postUnLike);
app.post("/api/post/:post_id/islike", post.postIsLike); // 필요?
app.get("/api/like/:user_id", like.myLike);

// POST
app.post("/api/post/create", post.create);
app.post("/api/post/:post_id/delete", post.delete);
app.post("/api/post/:post_id/update", post.update);
app.get("/api/post/:user_id", post.myPost);
app.get("/api/post/:post_id", post.getPost);
app.get("/api/post", post.getPostList);

// SEARCH
app.get("/api/post/search", search.search);

// PORTFOLIO
app.post("/api/portfolio/:user_id/create", portfolio.create);
app.post("/api/portfolio/:user_id/update", portfolio.update);
app.post("/api/portfolio/:user_id/delete", portfolio.delete);
app.get("/api/portfolio/:user_id", portfolio.info);

// S3
app.post("/api/upload", s3.getUrl);

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
    console.log("not secured");
  }
}

module.exports = server;
