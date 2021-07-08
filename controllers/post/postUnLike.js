const { posts } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  try{
    const { post_id } = req.params;
    const tokenBodyData = isAuthorized(req);
    if(!tokenBodyData){
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      })
    };

    const postDate = await posts.findOne({ 
      "_id": post_id,
      "likes.user_id": tokenBodyData.id
    });
    if(!postDate){
      return res.status(204).send({
        data: null,
        message: "이미 좋아요를 취소 했습니다"
      });
    };

    const update = {
      $pull: {
        likes: {
          user_id: tokenBodyData.id
        }
      }
    };
    await posts.updateOne({ _id: post_id}, update)
    .then(() => {
      res.status(201).send({
        data: {
          id: post_id
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