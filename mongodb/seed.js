require("../lib/mongooseConnector")();
const mongoose = require("mongoose");
const { usersSeeds, portfolioSeeds, post_userSeeds, postsSeeds, tagsSeeds } = require("./seedData");

const seeder = async (callback) => {
  const userData = await usersSeeds();
  await portfolioSeeds(userData._id);
  await post_userSeeds(userData._id);
  const postData = await postsSeeds(userData._id);
  await tagsSeeds(postData._id);

  await callback();
};

module.exports = seeder(() => {
  mongoose.disconnect((err) => {
    if(err) return console.log(err);
    console.log("successfully seeder");
  });
});