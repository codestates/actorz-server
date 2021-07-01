const { users, post_user } = require("../../mongodb/models");

module.exports = async (req, res) => {
  const { email } = req.body;
  await users.findOrCreate({email},{
    ...req.body,
    provider: "local"
  }).then( async ({ doc, created }) => {
    if(created){
      const newPostUser = await post_user.create({
        users: doc._id,
        posts: []
      });
      // console.log(newPostUser)
      res.status(201).send({
        data:{
          id: doc._id,
          postUserId: newPostUser._id
        },
        message: "ok"
      });
    }else{
      res.status(409).send({
        data: null,
        message: "이미 존재하는 이메일입니다"
      });
    }
  })
  .catch(err => {
    console.log(err)
  })
};