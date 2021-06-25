const { model, Schema } = require('mongoose')

const ObjectId = Schema.ObjectId;
const TagsSchema = new Schema({
    author: ObjectId,
    tag: String,
    date: {
      type: Date,
      default: new Date()
    }
});

module.exports = model('tags', TagsSchema);