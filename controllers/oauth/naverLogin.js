const axios = require("axios");
const { users, post_user } = require("../../mongodb/models");
const { generateAccessToken, generateRefreshToken } = require("../tokenHandle");


module.exports = async (req, res) => {
  const client_secret = process.env.NAVER_CLIENT_SECRET;
  const client_id = process.env.NAVER_CLIENT_ID;
  const redirectURI = encodeURI(process.env.NAVER_REDIRECT_URI);
  const state = "codeStates123";
  const code = req.body.code;
  const api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri${redirectURI}&code=${code}&state=${state}`;
  
  const token = await axios.get(api_url).then(res => res.data.access_token);
  console.log(token)
  const api_url2 = "https://openapi.naver.com/v1/nid/me";
  const headers = {"Authorization": `Bearer ${token}`};

  const userEmail = await axios.get(api_url2, { headers }).then(res => res.data.response.email);
  console.log(userEmail);

  await users.findOrCreate({
    email: userEmail,
    provider: "naver",
  }, {
    dob: new Date(),
    gender: false,
    name: "name",
    role: "guest"
  }).then( async ({ doc, created }) => {
    const payload = {
      id: doc.id,
      email: userEmail
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
    if(created){
      await post_user.create({
        users: doc._id,
        posts: []
      });
      res.status(201).send({
        data: {
          id: doc.id,
          accessToken
        },
        message: "ok"
      });
    }else{
      res.status(200).send({
        data: {
          id: doc.id,
          accessToken
        },
        message: "ok"
      });
    }
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  });
};
