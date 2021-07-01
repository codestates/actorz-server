const { users } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  const token = isAuthorized(req);

  if(!token) {
    res.status(400).json({
      data: null,
	    message: "You are currently not logined"
    });
  }else{
    await users.deleteOne({ _id: token.id });
    // console.log(token)
    res.status(205).send({
      data: {
        id: token.id
      },
      message: "Successfully signed out"
    });
  }
};