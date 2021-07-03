const { users, post_user, posts, portfolio } = require("../../mongodb/models");

module.exports = async (req, res) => {
  try{
    const { name, content } = req.query;
    const regEx = new RegExp(content);
    if(!name){
      if(!content){
        return await posts.find()
        .then((postsData) => {
          res.status(200).send({
            data: {
              posts: postsData
            },
            message: "ok"
          });
        });
      };

      return await posts.find({ content: regEx })
      .then((postsData) => {
        res.status(200).send({
          data: {
            posts: postsData
          },
          message: "ok"
        });
      });
    };
  
    await users.find({ name })
    .then((usersData) => usersData.map((data) => data._id))
    .then(async (usersId) => await post_user.find({ users: usersId }))
    .then((post_usersData) => [].concat(...post_usersData.map((data) => data.posts)))
    .then(async (postsId) => {
      if(!content){
        return await posts.find({ _id: postsId });
      };
      return await posts.find({ _id: postsId, content: regEx });
    })
    .then((postsData) => {
      res.status(200).send({
        data: {
          posts: postsData
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