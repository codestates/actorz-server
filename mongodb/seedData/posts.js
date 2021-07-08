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
      path: "https://i.ytimg.com/vi/tYM4oISacwY/maxresdefault.jpg",
    }],
    genre: "드라마",
    content: "박명수 명언",
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