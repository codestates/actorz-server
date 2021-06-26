require("dotenv").config();
const mongoose = require("mongoose");
const { usersSeeds, portfolioSeeds, post_userSeeds, postsSeeds, tagsSeeds } = require("./seedData");
const { mongodbConfig } = require("../config");

const mongodbUrl = process.env.MONGO_DB_URL;

mongoose.connect(mongodbUrl, mongodbConfig);

const seeder = async (callback) => {
  const userData = await usersSeeds();
  await portfolioSeeds(userData._id);
  await post_userSeeds(userData._id);
  const postData = await postsSeeds(userData._id);
  await tagsSeeds(postData._id);

  await callback();
};

seeder(() => {
  mongoose.disconnect((err) => {
    if(err) return console.log(err);
    console.log("successfully seeder");
  });
});