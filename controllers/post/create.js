const { users, posts } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  try{
    const tokenBodyData = isAuthorized(req);
    if(!tokenBodyData){
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      });
    };
    const userInfo = await users.findOne({ _id: tokenBodyData.id });

    const bodyData = {
      userInfo: {
        user_id: userInfo._id,
        name: userInfo.name
      },
      ...req.body
    };
    const newPost = await new posts(bodyData);
    newPost.save();
    res.status(201).send({
      data: {
        id: newPost.id
      },
      message: "ok"
    });
    
  }catch(err){
    console.log(err)
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};