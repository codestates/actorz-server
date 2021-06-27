require("dotenv").config();
const { sign, verify } = require("jsonwebtoken");
const ACCESS_SECRET = process.env.ACCESS_SECRET;

module.exports = {
  generateAccessToken: (data) => {
    if(!data.provider){
      data.provider = 'local'
    }
    if(!data.password){
      data.password = null
    }
    return sign(data, ACCESS_SECRET, { expiresIn: 60*60*3 });
  },
  isAuthorized: (req) => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return null;
    }
    const token = authorization.split(' ')[1];
    try {
      return verify(token, ACCESS_SECRET);
    } catch (err) {
      // return null if invalid token
      return null;
    }
  }
};