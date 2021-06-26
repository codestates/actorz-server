const mongoose = require('mongoose');
const { users } = require('./models');
const { usersSeeds } = require('./seedData');

const mongodbUrl = 'mongodb://localhost:27017/actorz';
const mongodbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}
mongoose.connect(mongodbUrl, mongodbConfig);

const seeder = async (callback) => {
  await users.insertMany(usersSeeds);

  await callback();
}

seeder(() => {
  mongoose.disconnect((err) => {
    if(err) return console.log(err);
    console.log('successfully seeder');
  });
})