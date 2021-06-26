require("dotenv").config()
const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const dbUrl = process.env.MONGO_DB_URL;

module.exports = {
  mongodbUrl: `mongodb+srv://${username}:${password}@${dbUrl}/${dbName}`,
  mongodbConfig: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  findAndModifyConfig: {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  }
}