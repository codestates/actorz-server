const { users } = require('../models');

console.log(users.findOne({name: 'leeact'}))

module.exports = [
  {
    type: '',
    path: '',
    content: '',
    genre: '',
    // tags: [],
    likes: []
  }
]