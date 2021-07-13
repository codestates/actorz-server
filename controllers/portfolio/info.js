const { users, posts, portfolio } = require("../../mongodb/models");

module.exports = async (req, res) => {
  try{
    const { user_id } = req.params;
    // 유효한 user_id인지 확인
    const userInfo = await users.findOne({ _id: user_id })
    .catch((err) => null);
    if(!userInfo){
      return res.status(400).send({
        data: null,
        message: "Invalid user ID"
      });
    };

    // password 정보 삭제
    delete userInfo._doc.password;

    // user_id가 유효하다면, user_id의 portfolio에 게시한 posts_id 찾기
    const postsId = await portfolio.findOne({user_id: userInfo._id})
    .then((pfData) => pfData.posts);
    // 찾은 posts_id로 해당 post들의 데이터 찾기
    const postsData = await posts.find({ _id: postsId });
    // 찾은 데이터를 유저정보와 함께 응답
    const bodyData = {
      ...userInfo._doc,
      posts: postsData
    };
    res.status(200).send({
      data: {
        portfolio: bodyData
      },
      message: "ok"
    });
    
  }catch(err){
    console.log(err);
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};