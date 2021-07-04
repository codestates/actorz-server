const { model, Schema } = require("mongoose")

const ObjectId = Schema.ObjectId;
const PostUserSchema = new Schema({
  author: ObjectId,
  posts: {
    type: [{
      type: ObjectId,
      ref: "posts",
      unique: true
    }]
  },
  users: {
    type: ObjectId,
    ref: "users",
    required: true,
    unique: true
  }
});

module.exports = model("post_user", PostUserSchema);