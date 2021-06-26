const { tags } = require('../models');

module.exports = async (post_id) => {
  const seedData = {
    tag: '도깨비',
    posts: [post_id]
  };
  const tagData = await new tags(seedData);

  return await tagData.save();
}