const { users, posts, post_user } = require("../../mongodb/models");

module.exports = async (req, res) => {
  try{
    const { user_id } = req.params;
    const userInfo = await users.findOne({ _id: user_id })
    .catch((err) => null);
    if(!userInfo){
      return res.status(400).send({
        data: null,
        message: "Invalid user ID"
      });
    };

    await post_user.findOne({ "users": user_id })
    .then(async (post_userData) => await posts.find({ _id: post_userData.posts }))
    .then((postsData) => {
      res.status(200).send({
        data: {
          posts: postsData
        },
        message: "ok"
      });
    });

  }catch(err){
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};