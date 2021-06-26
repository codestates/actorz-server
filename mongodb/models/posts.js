const { model, Schema } = require('mongoose')

const ObjectId = Schema.ObjectId;
const PostsSchema = new Schema({
  author: ObjectId,
  type: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  tags:{
    type: [{
      type: ObjectId,
      ref: 'tags'
    }]
  },
  likes: {
    type: [{
      user_id: {
        type: ObjectId,
        ref: 'users'
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('posts', PostsSchema);