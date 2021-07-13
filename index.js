require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const cookieParser = require("cookie-parser");

const { domain } = require("./config");
const dbConnector = require("./lib/mongooseConnector")(()=>{});



const { user, like, post, oauth, portfolio, s3, search, email } = require("./controllers");

const PORT = 3001;
const app = express();

app.use(cors({
  origin:[`https://${domain}`, `https://www.${domain}`],
  credentials:true,
  methods:["POST","GET","OPTIONS"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


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
app.get("/api/logout", user.logout);
app.post("/api/user/:user_id/delete", user.delete);
app.post("/api/user/:user_id/update", user.update);
app.get("/api/user/:user_id", user.info);

// OAUTH
app.post("/api/login/google", oauth.googleLogin);
app.post("/api/login/naver", oauth.naverLogin);

// LIKES
app.post("/api/post/:post_id/like", post.postLike);
app.post("/api/post/:post_id/unlike", post.postUnLike);
app.post("/api/post/:post_id/islike", post.postIsLike); // 필요?
app.get("/api/like/:user_id", like.myLike);

// SEARCH
app.get("/api/post/search", search.search);

// POST
app.post("/api/post/create", post.create);
app.post("/api/post/:post_id/delete", post.delete);
app.post("/api/post/:post_id/update", post.update);
app.get("/api/post/user/:user_id", post.myPost);
app.get("/api/post/:post_id", post.getPost);
app.get("/api/post", post.getPostList);

// PORTFOLIO
app.post("/api/portfolio/:user_id/create", portfolio.create);
app.post("/api/portfolio/:user_id/update", portfolio.update);
app.post("/api/portfolio/:user_id/delete", portfolio.delete);
app.get("/api/portfolio/:user_id", portfolio.info);

// S3
app.get("/api/upload", s3.getUrl);

// EMAIL
app.post("/api/email", email.send);

let server;
if(process.env.NODE_ENV === "production"){
  server = app.listen(PORT, () => {
    console.log(`http server, used port ${PORT}`)
  });
}else{
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
