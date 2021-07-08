const { posts, post_user } = require("../models");
const { findAndModifyConfig } = require("../../config");

module.exports = async (user_id, user_name, tag_id) => {
  const seedData = {
    userInfo: {
      user_id: user_id,
      name: user_name,
    },
    media: [{
      type: "img",
      path: "https://t1.daumcdn.net/cfile/tistory/273CC04F595F00DD34",
    }],
    content: "유부장",
    genre: ["드라마"],
    tags: [tag_id]
  };
  const postData = await new posts(seedData);

  return await postData.save()
  .then((data) => {
    post_user.findOneAndUpdate({
      users: user_id
    },{
      $push: {
        posts: data._id
      }
    }, findAndModifyConfig).exec();

    return data;
  });
}