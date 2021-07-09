const { users, portfolio } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");
const { findAndModifyConfig } = require("../../config");

module.exports = async (req, res) => {
  try{
    const tokenBodyData = isAuthorized(req);
    const { user_id } = req.params;
    const { password, posts } = req.body;

    // 해당 유저가 맞는지 확인
    if(!tokenBodyData || tokenBodyData.id !== user_id){
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      });
    };

    // 해당 유저가 요청한 것인지 password인증
    const accord = await users.findOne({
      _id: user_id,
      password
    });
    // password가 다르다면 accord === null
    if(!accord){
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      });
    };

    // posts의 정보가 담겨있는 배열에서 post_id를 추출
    const postsId = posts.map((post) => post._id)
    // 해당 유저의 요청이며, password가 일치한다면 portfolio 생성
    await portfolio.findOneAndUpdate({ user_id }, { posts: postsId }, findAndModifyConfig)
    .then((pfDate) => {
      res.status(201).send({
        data: {
          id: pfDate._id
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