require("dotenv").config();
const mongoose = require("mongoose");
const { mongodbUrl, mongodbConfig } = require("../config");

//require chalk module to give colors to console text
const chalk = require("chalk");

const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const disconnected = chalk.bold.red;
const termination = chalk.bold.magenta;

module.exports = async () => {
  await mongoose.connect(mongodbUrl, mongodbConfig);

  await mongoose.connection.on("connected", function(){
    console.log(connected("Mongoose default connection is open to ", mongodbUrl));
  });

  await mongoose.connection.on("error", function(err){
    console.log(error("Mongoose default connection has occured "+err+" error"));
  });

  await mongoose.connection.on("disconnected", function(){
    console.log(disconnected("Mongoose default connection is disconnected"));
  });

  await process.on("SIGINT", function(){
    mongoose.connection.close(function(){
      console.log(termination("Mongoose default connection is disconnected due to application termination"));
      process.exit(0)
    });
  });
  return mongoose.connection;
};