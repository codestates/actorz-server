const { model, Schema } = require("mongoose")

const ObjectId = Schema.ObjectId;
const PostUserSchema = new Schema({
  author: ObjectId,
  posts: {
    type: [{
      type: ObjectId,
      ref: "posts"
    }]
  },
  users: {
    type: ObjectId,
    ref: "users",
    unique: true
  }
});

module.exports = model("post_user", PostUserSchema);