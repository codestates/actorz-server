const { posts, users } = require("../../mongodb/models");

module.exports = async (req, res) => {
  try{
    const { post_id } = req.params;
    const postInfo = await posts.findOne({ _id: post_id })
    .catch((err) => null);
    if(!postInfo){
      return res.status(400).send({
        data: null,
        message: "Invalid post ID"
      });
    };

    const postOwner = await users
    .findOne({ _id: postInfo.userInfo.user_id });

    res.status(200).send({
      data: {
        post: postInfo,
        userPic: postOwner.mainPic
      },
      message: "ok"
    });

  }catch(err){
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};