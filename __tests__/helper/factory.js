const FactoryGirl = require('factory-girl');
const factory = FactoryGirl.factory;
const adapter = new FactoryGirl.MongooseAdapter();
const { users } = require("../../mongodb/models");

factory.setAdapter(adapter);

const dbConnector = require('../../lib/mongooseConnector');

// db connection create **
module.exports = {

  init: () => {
    // undo migrate
    // do migrate
    // do seed
  },

}