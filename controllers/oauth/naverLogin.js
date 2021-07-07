const axios = require("axios");
const { users, post_user } = require("../../mongodb/models");
const { generateAccessToken, generateRefreshToken } = require("../tokenHandle");

const client_secret = process.env.NAVER_CLIENT_SECRET;
const client_id = process.env.NAVER_CLIENT_ID;
const redirectURI = encodeURI(process.env.NAVER_REDIRECT_URI);
const state = "codeStates123";

module.exports = async (req, res) => {
  if(!req.body.code){
    res.status(500).send({
      data: null,
      message: "code not found"
    });
    return;
  }

  const code = req.body.code;
  const api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri${redirectURI}&code=${code}&state=${state}`;
  
  const token = await axios.get(api_url).then(res => res.data.access_token);
  console.log(token)

  if(!token){
    res.status(500).send({
      data: null,
      message: "token not found"
    });
    return;
  }
  const api_url2 = "https://openapi.naver.com/v1/nid/me";
  const headers = {"Authorization": `Bearer ${token}`};

  const email = await axios.get(api_url2, { headers }).then(res => res.data.response.email);
  console.log(email);

  if(!email){
    res.status(500).send({
      data: null,
      message: "email not found"
    });
    return;
  }

  let userInfo = await users.findOne({ 
    email,
    provider: "naver"
  });
  
  if(!userInfo){
    const bodyData = {
      provider: "naver",
      email: email,
      dob: new Date(),
      gender: false,
      name: "name",
      role: "guest",
      careers: []
    };
    userInfo = await new users(bodyData);
    userInfo.save(async (err, userdoc) => {
      if(err){
        res.status(500).send({
          data: null,
          message: "server error"
        });
      }else{
        const newPostUser = await new post_user({
          users: userdoc._id,
          posts: []
        });
        newPostUser.save((err, postdoc) => {
          if(err){
            res.status(500).send({
              data: null,
              message: "server error"
            });
          }else{
            const payload = {
              id: userdoc._id,
              email: email
            };
            const refreshToken = generateRefreshToken(payload);
            const accessToken = generateAccessToken(payload);
            res.cookie("refreshToken", refreshToken, {
              domain: "localhost",
              path: "/api/login/naver",
              maxAge: 24 * 6 * 60 * 10000,
              sameSite: "None",
              httpOnly: true,
              secure: true
            });
            res.status(201).send({
              data:{
                id: userdoc._id,
                postUserId: postdoc._id,
                accessToken
              },
              message: "ok"
            });
          } // if&else
        });// newPostUser save
      }//user save err else
    });//user save
  }else{
    const payload = {
      id: userInfo.id,
      email: email
    };
    const refreshToken = generateRefreshToken(payload);
    const accessToken = generateAccessToken(payload);
    res.cookie("refreshToken", refreshToken, {
      domain: "localhost",
      path: "/api/login/naver",
      maxAge: 24 * 6 * 60 * 10000,
      sameSite: "None",
      httpOnly: true,
      secure: true
    });
    res.status(200).send({
      data: {
        id: userInfo.id,
        accessToken
      },
      message: "ok"
    });
  }

  // await users.findOrCreate({
  //   email: userEmail,
  //   provider: "naver",
  // }, {
  //   dob: new Date(),
  //   gender: false,
  //   name: "name",
  //   role: "guest",
  //   careers: []
  // }).then( async ({ doc, created }) => {
  //   const payload = {
  //     id: doc.id,
  //     email: userEmail
  //   };
  //   const refreshToken = generateRefreshToken(payload);
  //   const accessToken = generateAccessToken(payload);
  //   res.cookie("refreshToken", refreshToken, {
  //     domain: "localhost",
  //     path: "/api/login/naver",
  //     maxAge: 24 * 6 * 60 * 10000,
  //     sameSite: "None",
  //     httpOnly: true,
  //     secure: true
  //   });
  //   if(created){
  //     await post_user.create({
  //       users: doc._id,
  //       posts: []
  //     });
  //     res.status(201).send({
  //       data: {
  //         id: doc.id,
  //         accessToken
  //       },
  //       message: "ok"
  //     });
  //   }else{
  //     res.status(200).send({
  //       data: {
  //         id: doc.id,
  //         accessToken
  //       },
  //       message: "ok"
  //     });
  //   }
  // })
  // .catch((err) => {
  //   console.log(err)
  //   res.status(500).send({
  //     data: null,
  //     message: "Server Error"
  //   });
  // });
};
