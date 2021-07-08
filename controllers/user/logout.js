const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  const token = isAuthorized(req);
  if(!token) {
    res.status(205).send({
      data: null,
	    message: "You are currently not logined but successfully signed out"
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