const { posts } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  try{
    const { post_id } = req.params;
    const tokenBodyData = isAuthorized(req);
    if(!tokenBodyData){
      return res.status(202).send({
        data: null,
        message: "not found"
      })
    };

    const postDate = await posts.findOne({ 
      "_id": post_id,
      "likes.user_id": tokenBodyData.user_id
    });
    if(postDate){
      return res.status(200).send({
        data: {
          id: post_id
        },
        message: "like"
      });
    };

    res.status(200).send({
      data: {
        id: post_id
      },
      message: "unlike"
    });

  }catch(err){
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};