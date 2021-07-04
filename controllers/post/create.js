const { users, posts, post_user } = require("../../mongodb/models");
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
    };
    
    const userInfo = await users.findById(tokenBodyData.user_id);
    const bodyData = {
      userInfo: {
        user_id: userInfo._id,
        name: userInfo.name
      },
      ...req.body
    };
    const newPost = await new posts(bodyData);
    newPost.save();

    const conditions = { users: tokenBodyData.user_id };
    const update = { $push: { posts: newPost._id } };
    await post_user.findOneAndUpdate(conditions, update, findAndModifyConfig)
    .then(() => {
      res.status(201).send({
        data: {
          id: newPost._id
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