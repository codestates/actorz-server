const { users } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  const token = isAuthorized(req);
  if(!token) {
    res.status(401).send({
      data: null,
	    message: "Authorization dont exist"
    });
  }else{
    const user = await users.findOneAndUpdate({ _id: token.id }, req.body);
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