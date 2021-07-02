const { posts, post_user } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");
const { findAndModifyConfig } = require("../../config");

module.exports = async (req, res) => {
  try{
    const tokenBodyData = isAuthorized(req);
    if(!tokenBodyData){
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      });
    }
    const post_id = await posts.create(req.body)
    .then((result) => result._id);
    
    const conditions = { users: tokenBodyData.user_id };
    const update = { $push: { posts: post_id } };
    await post_user.findOneAndUpdate(conditions, update, findAndModifyConfig);
    
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