const { users } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
  const token = isAuthorized(req);
  if(!token) {
    res.status(401).send({
      data: null,
	    message: "Authorization dont exist"
    });
  }else{
    // console.log(update)
    // console.log(token.id)
    const user = await users.findOneAndUpdate({ email: token.email }, req.body);
    if(req.body.password){
      bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS), function(err, salt){
        if(err){ 
          console.log(err);
          return;
        }
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
          if(err){
            console.log(err)
            return;
          }
          await users.findOneAndUpdate({ email: token.email }, { password: hash });
        });
      });
    }
    // console.log(user)
    res.status(200).send({
      data: {
        userInfo: {
          id: user._id,
          ...user._doc,
          _id: undefined,
          password: undefined,
          createdAt: undefined,
          __v: undefined
        }
      },
      message: "ok"
    });
  }
};