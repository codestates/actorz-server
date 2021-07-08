const mongoose = require("mongoose");
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

    const accord = await posts.findOne({ 
      _id: post_id, 
      "userInfo.user_id": mongoose.Types.ObjectId(tokenBodyData.id) 
    });
    if(!accord) {
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      });
    }

    await posts.findByIdAndUpdate(post_id, req.body, findAndModifyConfig)
    .then((result) => {
      res.status(200).send({
        data: {
          post: result
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