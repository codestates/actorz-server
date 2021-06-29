require("dotenv").config()

let username, password, dbName, dbUrl;

if(process.env.NODE_ENV === "production"){
  username = process.env.MONGO_DB_USERNAME;
  password = process.env.MONGO_DB_PASSWORD;
  dbName = process.env.MONGO_DB_NAME;
  dbUrl = process.env.MONGO_DB_URL;
}else{
  username = process.env.TESTING_DB_USERNAME;
  password = process.env.TESTING_DB_PASSWORD;
  dbName = process.env.TESTING_DB_NAME;
  dbUrl = process.env.TESTING_DB_URL;  
}

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