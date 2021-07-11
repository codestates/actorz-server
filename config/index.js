require("dotenv").config()

let username, password, dbName, dbUrl, redirectUri, domain;

if(process.env.NODE_ENV === "production"){
  redirectUri = process.env.REDIRECT_URI;
  username = process.env.MONGO_DB_USERNAME;
  password = process.env.MONGO_DB_PASSWORD;
  dbName = process.env.MONGO_DB_NAME;
  dbUrl = process.env.MONGO_DB_URL;
  domain = "actorz.click"
}else{
  redirectUri = process.env.REDIRECT_URI_TEST;
  username = process.env.TESTING_DB_USERNAME;
  password = process.env.TESTING_DB_PASSWORD;
  dbName = process.env.TESTING_DB_NAME;
  dbUrl = process.env.TESTING_DB_URL;  
  domain = "localhost:3000"
}

module.exports = {
  domain,
  redirectUri,
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