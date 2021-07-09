const axios = require("axios");
const { redirectUri, domain } = require("../../config");
const { users, post_user } = require("../../mongodb/models");
const { generateAccessToken, generateRefreshToken } = require("../tokenHandle");

const client_secret = process.env.NAVER_CLIENT_SECRET;
const client_id = process.env.NAVER_CLIENT_ID;
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
  const api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri${encodeURI(redirectUri)}&code=${code}&state=${state}`;
  
  const token = await axios.get(api_url).then(res => res.data.access_token);
  console.log("==token==")
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
  console.log("====== EMAIL ========");
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
  if(userInfo){
    const payload = {
      id: userInfo.id,
      email: email
    };
    const refreshToken = generateRefreshToken(payload);
    const accessToken = generateAccessToken(payload);
    res.cookie("refreshToken", refreshToken, {
      domain: domain,
      path: "/",
      maxAge: 24 * 6 * 60 * 10000,
      sameSite: "None",
      httpOnly: true,
      secure: true
    });
    res.status(200).send({ //for login
      data: {
        id: userInfo.id,
        accessToken
      },
      message: "ok"
    });
  }else{ //not existing user
    res.status(201).send({ //send Email from token
      data: {
        email
      },
      message: "new user"
    });
  }
};

// if(req.body.role && req.body.role !== "guest"){ //if for signup
//   const bodyData = {
//     provider: "naver",
//     email: email,
//     ...req.body,
//     code: undefined
//   };
//   userInfo = await new users(bodyData);
//   userInfo.save(async (err, userdoc) => {
//     if(err){
//       console.log(err)
//       res.status(500).send({
//         data: null,
//         message: "server error"
//       });
//     }else{
//       const newPostUser = await new post_user({
//         users: userdoc._id,
//         posts: new Array()
//       });
//       newPostUser.save((err, postdoc) => {
//         if(err){
//           console.log(err)
//           res.status(500).send({
//             data: null,
//             message: "server error"
//           });
//         }else{
//           const payload = {
//             id: userdoc._id,
//             email: email
//           };
//           const refreshToken = generateRefreshToken(payload);
//           const accessToken = generateAccessToken(payload);
//           res.cookie("refreshToken", refreshToken, {
//             domain: "localhost",
//             path: "/",
//             maxAge: 24 * 6 * 60 * 10000,
//             sameSite: "None",
//             httpOnly: true,
//             secure: true
//           });
//           res.status(201).send({
//             data:{
//               id: userdoc._id,
//               postUserId: postdoc._id,
//               accessToken
//             },
//             message: "ok"
//           });
//         } // if&else
//       });// newPostUser save
//     }//user save err else
//   });