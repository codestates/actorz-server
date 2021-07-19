const { users, portfolio } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  try{
    const tokenBodyData = isAuthorized(req);
    const { user_id } = req.params;
    // const { password, posts } = req.body;
    const { posts } = req.body;
    // posts의 정보가 담겨있는 배열에서 post_id를 추출
    const postsId = posts.map((post) => post._id);

    // 해당 유저가 맞는지 확인
    if(!tokenBodyData || tokenBodyData.id !== user_id){
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      });
    };

    // 생성할 portfolio의 bodyData 생성
    const bodyData = {
      user_id,
      posts: postsId
    };
    // portfolio 생성
    const newPortfolio = await new portfolio(bodyData);
    newPortfolio.save((err) => {
      if(err) {
        console.log(err);
        return res.status(409).send({
          data: null,
          message: "이미 생성되었습니다"
        })
      }
      res.status(201).send({
        data: {
          id: newPortfolio.id
        },
        message: "ok"
      });
    });

  }catch(err){
    console.log(err)
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};