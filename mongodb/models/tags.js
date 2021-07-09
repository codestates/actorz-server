const { model, Schema } = require("mongoose")

const ObjectId = Schema.ObjectId;
const TagsSchema = new Schema({
  author: ObjectId,
  tag: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = model("tags", TagsSchema);