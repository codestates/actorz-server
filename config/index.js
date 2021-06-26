module.exports = {
  mongodbConfig: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  findAndModifyConfig: {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  }
}