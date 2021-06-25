const { model, Schema } = require('mongoose')

const ObjectId = Schema.ObjectId;
const UsersSchema = new Schema({
    author: ObjectId,
    mainPic: String,
    email: String,
    password: String,
    name: String,
    company: String,
    provider: String,
    gender: Boolean,
    dob: Date,
    date: {
      type: Date,
      default: new Date()
    }
});

module.exports = model('users', UsersSchema);