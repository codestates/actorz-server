require("../lib/mongooseConnector")(() => {
  console.log("migrating...");
});
const mongoose = require("mongoose");
const { users, posts, post_user, tags, portfolio } = require("./models");

const migrate = async (callback) => {
  await users.createCollection();
  await posts.createCollection();
  await post_user.createCollection();
  await tags.createCollection();
  await portfolio.createCollection();
  await callback();
}

module.exports = migrate(() => {
  mongoose.disconnect((err) => {
    if(err) return console.log(err);
    console.log("successfully migrate");
  });
})