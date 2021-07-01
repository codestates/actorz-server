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
    const post_userData = await post_user.findOne({ "users": user_id });
    const postsData = [];

    for(let el of post_userData.posts){
      const postData = await posts.findById(el);
      postsData.push(postData);
    };

    res.status(200).send({
      data: {
        posts: postsData
      },
      message: "ok"
    });
  }catch(err){
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  }
};