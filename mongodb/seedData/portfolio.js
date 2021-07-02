const { portfolio } = require("../models");

module.exports = async (user_id, post_id) => {
  const seedData = {
    user_id,
    posts: [post_id]
  };
  const portfolioData = await new portfolio(seedData);

  return await portfolioData.save();
}