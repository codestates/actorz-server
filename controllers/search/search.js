const { users, posts } = require("../../mongodb/models");

module.exports = async (req, res) => {
  try{
    const { name, age, content } = req.query;
    const toDay = new Date();
    const year = toDay.getFullYear();
    const month = toDay.getMonth();
    const day = toDay.getDate();
    const regEx = new RegExp(content);
    
    let postsData;
    let usersData;
    let usersId;

    if(!name){
      if(!age){
        if(!content){
          postsData = await posts.find();
        }else{
          postsData = await posts.find({ content: regEx });
        };
      }else{
        usersData = await users.find({
          dob: {
            $gte: new Date(year - (Number(age) + 10 ), month, day), 
            $lt: new Date(year - Number(age), month, day)
          }
        })
        usersId = usersData.map((data) => data._id);
        if(!content){
          postsData = await posts.find({ "userInfo.user_id": usersId });
        }else{
          postsData = await posts.find({ "userInfo.user_id": usersId, content: regEx });
        }
      }
    }else{
      if(!age){
        usersData = await users.find({ name });
      }else{
        usersData = await users.find({
          name,
          dob: {
            $gte: new Date(year - (age + 10 ), month, day), 
            $lt: new Date(year - age, month, day)
          }
        });
      }
      usersId = usersData.map((data) => data._id);
      if(!content){
        postsData = await posts.find({ "userInfo.user_id": usersId });
      }else{
        postsData = await posts.find({ "userInfo.user_id": usersId, content: regEx });
      }
    };

    res.status(200).send({
      data: {
        posts: postsData
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