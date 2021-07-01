const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  const token = isAuthorized(req);
  if(!token) {
    res.status(400).send({
      data: null,
	    message: "You are currently not logined"
    });
  }else{
    res.status(205).cookie("refreshToken", "invalidtoken").send({
      data: {
        id: token.id
      },
      message: "Successfully signed out"
    });
  }
};