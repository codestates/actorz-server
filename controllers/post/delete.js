const mongoose = require("mongoose");
const { posts } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");
const deleteObject = require("../s3/deleteObject");

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

    // const accord = await posts.findOne({ 
    //   _id: post_id, 
    //   "userInfo.user_id": mongoose.Types.ObjectId(tokenBodyData.id) 
    // });
    // if(!accord) {
    //   return res.status(401).send({
    //     data: null,
    //     message: "Authorization dont exist"
    //   });
    // }

    await posts.findOneAndDelete({ _id: post_id })
    .then((result) => {
      deleteObject(result.media);
      res.status(200).send({
        data: {
          id: result._id
        },
        message: "Successfully post delete"
      });
    });

  }catch(err){
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};