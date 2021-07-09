const { model, Schema } = require("mongoose")

const ObjectId = Schema.ObjectId;
const PostsSchema = new Schema({
  author: ObjectId,
  userInfo: {
    type: {
      user_id: {
        type: ObjectId,
        ref: "users",
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    required: true
  },
  media: {
    type: [{
      type: {
        type: String,
        enum: ["img", "video"],
        required: true
      },
      path: {
        type: String,
        required: true
      }
    }],
    required: true
  },
  content: String,
  genre: {
    type: String,
    required: true,
    enum: ["드라마", "판타지", "액션", "공포", "코미디", "기타"]
  },
  tags:{
    type: [{
      type: ObjectId,
      ref: "tags"
    }]
  },
  likes: {
    type: [{
      user_id: {
        type: ObjectId,
        ref: "users"
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