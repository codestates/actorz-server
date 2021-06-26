const { model, Schema } = require("mongoose")

const ObjectId = Schema.ObjectId;
const PortfolioSchema = new Schema({
  author: ObjectId,
  user_id: {
    type: ObjectId,
    ref: "users",
    required: true,
    unique: true
  },
  posts: {
    type: [{
      type: ObjectId,
      ref: "posts"
    }]
  }
});

module.exports = model("portfolio", PortfolioSchema);