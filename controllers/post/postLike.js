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
    }
    const postDate = await posts.findById(post_id);
    const isLikePost = postDate.likes.filter((data) => data.user_id.toString() === tokenBodyData.user_id);
    
    if(isLikePost[0]){
      return res.status(204).send({
        data: null,
        message: "이미 좋아요를 눌렀습니다"
      });
    };
    const update = {
      $push: {
        likes: {
          user_id: tokenBodyData.user_id
        }
      }
    };

    await posts.updateOne({ _id: post_id}, update)
    res.status(201).send({
      data: {
        id: post_id
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