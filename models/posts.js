const { model, Schema } = require('mongoose')

const ObjectId = Schema.ObjectId;
const PostsSchema = new Schema({
    author: ObjectId,
    type: String,
    path: String,
    content: String,
    genre: String,
    updatedAt: {
      type: Date,
      default: new Date()
    },
    date: {
      type: Date,
      default: new Date()
    }
});

module.exports = model('posts', PostsSchema);