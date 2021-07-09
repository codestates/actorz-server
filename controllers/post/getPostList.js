const { posts } = require("../../mongodb/models");

module.exports = async (req, res) => {
  try{
    const postInfoArr = await posts.find()
    .catch((err) => []);
    res.status(200).send({
      data: {
        posts: postInfoArr
      },
      message: "ok"
    });
    
  }catch(err){
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};