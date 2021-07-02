require("../lib/mongooseConnector")(() => {
  console.log("planting seeds...");
});
const mongoose = require("mongoose");
const { usersSeeds, portfolioSeeds, post_userSeeds, postsSeeds, tagsSeeds } = require("./seedData");

const seeder = async (callback) => {
  const userData = await usersSeeds();
  await post_userSeeds(userData._id);
  const tagData = await tagsSeeds();
  const postData = await postsSeeds(userData._id, tagData._id);
  await portfolioSeeds(userData._id, postData._id);

  await callback();
};

module.exports = seeder(() => {
  mongoose.disconnect((err) => {
    if(err) return console.log(err);
    console.log("successfully seeder");
  });
});