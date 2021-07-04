const { users, post_user } = require("../../mongodb/models");
const { generateAccessToken, generateRefreshToken } = require("../tokenHandle");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = async (req, res) => {
    const { token }  = req.body
    console.log(req.body)
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name } = ticket.getPayload();  
    console.log(ticket.getPayload())
    await users.findOrCreate({
      email: email,
    }, {
      provider: "google",
      dob: new Date(),
      gender: false,
      name: "name"
    }).then( async ({ doc, created }) => {
      const payload = {
        id: doc.id,
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