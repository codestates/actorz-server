const mongoose = require("mongoose");
const { users, posts, post_user, portfolio } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");
const deleteObject = require("../s3/deleteObject");

module.exports = async (req, res) => {
  const token = isAuthorized(req);

  if(!token) {
    res.status(400).json({
      data: null,
	    message: "You are currently not logined"
    });
  }else{
    const user_id = mongoose.Types.ObjectId(token.id);
    await posts.find({ "userInfo.user_id": user_id })
    .then((result) => {
      if(result.length > 0){
        const media = result.reduce((acc, cur) => acc.concat(cur.media), []);
        deleteObject(media);
      }
    })
    await portfolio.deleteOne({ user_id });
    await post_user.deleteOne({ users: user_id });
    await posts.deleteMany({ "userInfo.user_id": user_id });
    await users.deleteOne({ _id: user_id });
    // console.log(token)
    res.status(205).cookie("refreshToken", "invalidtoken", {
      maxAge: 60 * 60 * 24,
      sameSite: "None",
      httpOnly: true,
      secure: true
    }).send({
      data: {
        id: token.id
      },
      message: "Successfully signed out"
    });
  }
};