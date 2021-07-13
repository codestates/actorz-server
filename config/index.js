require("dotenv").config()

let username, password, dbName, dbUrl, redirectUri, domain;

if(process.env.NODE_ENV === "production"){
  redirectUri = process.env.REDIRECT_URI;
  username = process.env.MONGO_DB_USERNAME;
  password = process.env.MONGO_DB_PASSWORD;
  dbName = process.env.MONGO_DB_NAME;
  dbUrl = process.env.MONGO_DB_URL;
  domain = "actorz.click";
  
  emailSmtpHost = process.env.NODEMAILER_SMTP_ENDPOINT;
  emailService = process.env.NODEMAILER_SERVICE;
  emailUser = process.env.NODEMAILER_USER;
  emailPassword = process.env.NODEMAILER_PASSWORD;
}else{
  redirectUri = process.env.REDIRECT_URI_TEST;
  username = process.env.TESTING_DB_USERNAME;
  password = process.env.TESTING_DB_PASSWORD;
  dbName = process.env.TESTING_DB_NAME;
  dbUrl = process.env.TESTING_DB_URL;  
  domain = "localhost:3000";

  emailSmtpHost = process.env.NODEMAILER_SMTP_ENDPOINT_TSET;
  emailService = process.env.NODEMAILER_SERVICE_TEST;
  emailUser = process.env.NODEMAILER_USER_TEST;
  emailPassword = process.env.NODEMAILER_PASSWORD_TEST;
}

module.exports = {
  domain,
  redirectUri,
  emailSmtpHost,
  emailService,
  emailUser,
  emailPassword,
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