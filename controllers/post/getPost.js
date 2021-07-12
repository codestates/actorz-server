const { posts } = require("../../mongodb/models");

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

    res.status(200).send({
      data: {
        post: postInfo
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