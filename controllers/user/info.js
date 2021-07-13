const { users } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  let user = await users.findOne({ _id: req.params.user_id });
  if(user){
    user = {
      id: user._id,
      ...user._doc,
      password: undefined,
      createdAt: undefined,
      _id: undefined,
      __v: undefined
    }
    console.log(user)
    res.status(200).send({
      data: {
        userInfo: user
      },
      message: "ok"
    });
  }else{
    res.status(409).send({
      data: {
        userInfo: null
      },
      message: "user not found"
    });
  }
};