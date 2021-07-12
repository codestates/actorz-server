const { users, post_user } = require("../../mongodb/models");
const { generateAccessToken, generateRefreshToken } = require("../tokenHandle");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = async (req, res) => {
  console.log(req.body)
  let ticket, token;
  try{
    token  = req.body.code;
  }catch(err){
    console.log("token not found");
    res.status(500).send("server Error");
    return null;
  }

  try{
    ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  }catch(err){
    console.log("token not verified");
    res.status(500).send("server Error");
    return null;
  }

  const { email } = ticket.getPayload();
  
  if(!email){
    res.status(500).send({
      data: null,
      message: "email not found"
    });
    return;
  }

  let userInfo = await users.findOne({ 
    email
  });
  
  if(!userInfo){
    res.status(201).send({ //send Email from token
      data: {
        email
      },
      message: "new user"
    });
  }else{
    const payload = {
      id: userInfo.id,
      email: email
    };
    const refreshToken = generateRefreshToken(payload);
    const accessToken = generateAccessToken(payload);
    res.cookie("refreshToken", refreshToken, {
      domain: "localhost",
      path: "/api/login/google",
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
    //   email: email,
    //   provider: "google",
    // }, {
    //   dob: new Date(),
    //   gender: false,
    //   name: "name",
    //   role: "guest"
    // }).then( async ({ doc, created }) => {
    //   const payload = {
    //     id: doc.id,
    //     email: email
    //   };
    //   const refreshToken = generateRefreshToken(payload);
    //   const accessToken = generateAccessToken(payload);
    //   res.cookie("refreshToken", refreshToken, {
    //     domain: "localhost",
    //     path: "/api/login/google",
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