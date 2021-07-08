const { users } = require("../../mongodb/models");

module.exports = async (req, res) => {
  let user = await users.findOne({ _id: token.id });
  if(user){
    user = {
      id: user._id,
      ...user._doc,
      password: undefined,
      createdAt: undefined,
      _id: undefined,
      __v: undefined
    }
    res.status(200).send({
      data: {
        userInfo: user
      },
      message: "ok"
    });
  }else{
    res.status(200).send({
      data: {
        userInfo: null
      },
      message: "force logout"
    });
  }
};