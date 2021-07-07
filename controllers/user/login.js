const { users } = require("../../mongodb/models");
const { generateRefreshToken, generateAccessToken } = require("../tokenHandle");

module.exports = async (req, res) => {
    const userInfo = await users.findOne({
      email: req.body.email,
      provider: "local"
    });

    if(userInfo){
      console.log(userInfo)
      await userInfo.comparePassword(req.body.password, (err, isMatch) => {
        if(err || !isMatch){
          console.log(err);
          res.status(401).send({
            data: null,
            message: "Invalid user or Wrong password"
          });
        }else{
          const payload = {
            id: userInfo.id,
            email: userInfo.email
          };
          const refreshToken = generateRefreshToken(payload);
          const accessToken = generateAccessToken(payload);
          res.status(200).cookie("refreshToken", refreshToken, {
            domain: "localhost",
            path: "/api/login",
            maxAge: 24 * 6 * 60 * 10000,
            sameSite: "None",
            httpOnly: true,
            secure: true
          }).send({
            data: {accessToken: accessToken},
            message: "ok"
          });
        }
      });
    }else{
      res.status(401).send({
        data: null,
        message: "Invalid user or Wrong password"
      });
    }

    // if(!userInfo || !isMatch){
    //   console.log(isMatch);
    //   res.status(401).send({
    //     data: null,
    //     message: "Invalid user or Wrong password"
    //   });
    // }else{
    //   const payload = {
    //     id: userInfo.id,
    //     email: userInfo.email
    //   };
    //   const refreshToken = generateRefreshToken(payload);
    //   const accessToken = generateAccessToken(payload);
    //   res.status(200).cookie("refreshToken", refreshToken, {
    //     domain: "localhost",
    //     path: "/api/login",
    //     maxAge: 24 * 6 * 60 * 10000,
    //     sameSite: "None",
    //     httpOnly: true,
    //     secure: true
    //   }).send({
    //     data: {accessToken: accessToken},
    //     message: "ok"
    //   });
    // }
};