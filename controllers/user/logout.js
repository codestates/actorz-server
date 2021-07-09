module.exports = async (req, res) => {
  res.status(205).cookie("refreshToken", "invalidtoken").send({
    data: null,
    message: "Successfully signed out"
  });
};