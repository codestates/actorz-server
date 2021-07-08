const { users, post_user } = require("../../mongodb/models");

module.exports = async (req, res) => {
  const { email } = req.body;
  console.log(req.body)
  
  const userInfo = await users.findOne({ email });
  if(!userInfo){
    const bodyData = {
      ...req.body,
    };
    const newUser = await new users(bodyData);
    newUser.save(async (err, doc) => {
      if(err){
        console.log(err);
        res.status(500).send({
          data: null,
          message: "server error"
        });
      }else{
        const newPostUser = await new post_user({
          users: doc._id,
          posts: []
        });
        newPostUser.save((err, doc) => {
          if(err){
            console.log(err);
            res.status(500).send({
              data: null,
              message: "server error"
            });
          }else{
            res.status(201).send({
              data:{
                id: doc._id,
                email: doc.email,
                postUserId: newPostUser._id
              },
              message: "ok"
            });
          } // if&else
        });// newPostUser save
      }//user save err else
    });//user save
  }else{
    res.status(409).send({
      data: null,
      message: "이미 존재하는 이메일입니다"
    });
  }
};