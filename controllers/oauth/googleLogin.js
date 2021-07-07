const { users, post_user } = require("../../mongodb/models");
const { generateAccessToken, generateRefreshToken } = require("../tokenHandle");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = async (req, res) => {
  let ticket, token;
  try{
    token  = req.body.token;
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
    email,
    provider: "google"
  });
  
  if(!userInfo){
    const bodyData = {
      provider: "google",
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
              path: "/api/login/google",
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