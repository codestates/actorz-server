const { users, posts } = require("../../mongodb/models");

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

    await posts.find({ "userInfo.user_id": userInfo._id })
    .then((postsData) => {
      console.log(postsData)
      res.status(200).send({
        data: {
          posts: postsData
        },
        message: "ok"
      });
    });

  }catch(err){
    console.log(err)
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};