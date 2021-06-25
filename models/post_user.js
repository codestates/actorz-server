const { model, Schema } = require('mongoose')

const ObjectId = Schema.ObjectId;
const PostUserSchema = new Schema({
    author: ObjectId,
    date: {
      type: Date,
      default: new Date()
    }
});

module.exports = model('post_user', PostUserSchema);