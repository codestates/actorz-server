const { posts } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");
const { findAndModifyConfig } = require("../../config");

module.exports = async (req, res) => {
  try{
    const { post_id } = req.params;
    const tokenBodyData = isAuthorized(req);
    if(!tokenBodyData){
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      });
    };
    
    const postData = await posts.findOne({
      "_id": post_id,
      "likes.user_id": tokenBodyData.id
    });
    if(postData){
      return res.status(204).send({
        data: null,
        message: "이미 좋아요를 눌렀습니다"
      });
    };

    const update = {
      $push: {
        likes: {
          user_id: tokenBodyData.id
        }
      }
    };
    await posts.findOneAndUpdate({ _id: post_id}, update, findAndModifyConfig)
    .then((result) => {
      res.status(201).send({
        data: {
          id: result.id,
          likes: result.likes
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