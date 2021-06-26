const mongoose = require('mongoose');
const { users, posts, post_user, tag, portpolio } = require('./models');

const mongodbUrl = 'mongodb://localhost:27017/actorz';
const mongodbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}
mongoose.connect(mongodbUrl, mongodbConfig);

// migrate
const migrate = async (callback) => {
  await users.createCollection();
  await posts.createCollection();
  await post_user.createCollection();
  await tag.createCollection();
  await portpolio.createCollection();
  await callback();
}

// migrate all undo
// const migrate = async (callback) => {
//   await users.collection.drop();
//   await posts.collection.drop();
//   await post_user.collection.drop();
//   await tag.collection.drop();
//   await portpolio.collection.drop();
//   await callback();
// }


migrate(() => {
  mongoose.disconnect((err) => {
    if(err) return console.log(err);
    console.log('successfully migrate');
  });
})