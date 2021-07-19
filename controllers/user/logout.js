const { domain } = require("../../config");
module.exports = async (req, res) => {

  res.status(205).cookie("refreshToken", "invalidtoken", {
    maxAge: 60 * 60 * 24,
    sameSite: "None",
    httpOnly: true,
    secure: true
  }).send({
    data: null,
    message: "Successfully signed out"
  });
};