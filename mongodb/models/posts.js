const { model, Schema } = require("mongoose")

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
    type: String
  },
  genre: {
    type: String,
    required: true
  },
  tags:{
    type: []
  },
  likes: {
    type: [{
      user_id: {
        type: ObjectId,
        ref: "users",
        unique: true
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

module.exports = model("posts", PostsSchema);