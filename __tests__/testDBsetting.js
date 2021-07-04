const { users, posts, post_user, tags, portfolio } = require("../mongodb/models");
const { usersSeeds, portfolioSeeds, post_userSeeds, postsSeeds, tagsSeeds } = require("../mongodb/seedData");

const migrateAndseeds = async () => {
  await users.collection.drop();
  await posts.collection.drop();
  await post_user.collection.drop();
  await tags.collection.drop();
  await portfolio.collection.drop();
  
  await users.createCollection();
  await posts.createCollection();
  await post_user.createCollection();
  await tags.createCollection();
  await portfolio.createCollection();

  const userData = await usersSeeds();
  const tagData = await tagsSeeds();
  const postData = await postsSeeds(userData._id, userData.name, tagData._id);
  await portfolioSeeds(userData._id, postData._id);
}

module.exports = migrateAndseeds;