const { portfolio } = require('../models');

module.exports = async (user_id) => {
  const seedData = {
    user_id
  };
  const portfolioData = await new portfolio(seedData);

  return await portfolioData.save();
}