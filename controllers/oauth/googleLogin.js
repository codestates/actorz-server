const { users } = require("../../mongodb/models");
const { generateAccessToken, generateRefreshToken } = require("../tokenHandle");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = async (req, res) => {
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
      maxAge: 60 * 60 * 24,
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
};