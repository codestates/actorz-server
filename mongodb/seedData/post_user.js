const { post_user } = require("../models");

module.exports = async (user_id) => {
  const seedData = {
    users: user_id
  };
  const post_userData = await new post_user(seedData);

  return await post_userData.save();
}