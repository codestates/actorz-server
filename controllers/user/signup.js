const { domain } = require("../../config");
const { generateRefreshToken, generateAccessToken } = require("../tokenHandle");
const { users, post_user } = require("../../mongodb/models");

module.exports = async (req, res) => {
  const { email } = req.body;
  
  const userInfo = await users.findOne({ email });
  if(!userInfo){
    const bodyData = {
      ...req.body,
    };
    const newUser = await new users(bodyData);
    newUser.save(async (err, userdoc) => {
      if(err){
        console.log(err);
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
            console.log(err);
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
              domain: domain,
              path: "/",
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
    res.status(409).send({
      data: null,
      message: "이미 존재하는 이메일입니다"
    });
  }
};