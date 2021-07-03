require("dotenv").config();
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const { sign, verify } = require("jsonwebtoken");

module.exports = {
  generateAccessToken: (data) => {
    return sign(data, ACCESS_SECRET, { expiresIn: 60*60*3 });
  },
  generateRefreshToken: (data) => {
    return sign(data, REFRESH_SECRET, { expiresIn: 60*60*6 });
  },
  isAuthorized: (req) => {
    const authorization = req.headers["authorization"];

    if(!authorization){
      return null;
    }else{
      const token = authorization.split(" ")[1];
      try{
        return verify(token, ACCESS_SECRET);
      }catch(err){
        // return null if invalid token
        try{
          const cookieToken = req.cookies.refreshToken;
          if(
            !cookieToken &&
            cookieToken === "invalidtoken"
          ){
            return null;
          }
          const data = verify(cookieToken, REFRESH_SECRET);
          const payload = { 
            id: data.id,
            email: data.email 
          };
          return sign(payload, ACCESS_SECRET, { expiresIn: 60*60*3 });
        }catch(err){
          return null;
        }
      }
    }
  },
  refreshToken: (req) => {
    const cookieToken = req.cookies.refreshToken;
    if(
      !cookieToken &&
      cookieToken === "invalidtoken"
    ){
      return null;
    }
    try{
      const data = verify(cookieToken, REFRESH_SECRET);
      const payload = { 
        id: data.id,
        email: data.email 
      };
      return sign(payload, ACCESS_SECRET, { expiresIn: 60*60*3 });
    }catch(err){
      return null;
    }
  }
};