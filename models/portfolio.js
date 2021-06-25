const { model, Schema } = require('mongoose')

const ObjectId = Schema.ObjectId;
const PortfolioSchema = new Schema({
    author: ObjectId,
    user_id: String,
    date: {
      type: Date,
      default: new Date()
    }
});

module.exports = model('portfolio', PortfolioSchema);