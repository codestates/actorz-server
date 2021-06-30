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
  await portfolioSeeds(userData._id);
  await post_userSeeds(userData._id);
  const postData = await postsSeeds(userData._id);
  await tagsSeeds(postData._id);
}

module.exports = migrateAndseeds;