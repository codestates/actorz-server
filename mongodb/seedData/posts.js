const { posts, post_user, portfolio } = require('../models');
const { findAndModifyConfig } = require('../../config');

module.exports = async (user_id) => {
  const seedData = {
    type: 'img',
    path: 'https://ncache.ilbe.com/files/attach/new/20200206/4255758/1621045151/11231547442/2a4742fc9ee703223e7b964de8730732_11231547478.jpg',
    content: '귀여운 고양이',
    genre: '귀욤',
    tags: ['도깨비']
  };
  const postData = await new posts(seedData);

  return await postData.save()
  .then((data) => {
    post_user.findOneAndUpdate({
      users: user_id
    }, {
      $push: {
        posts: data._id
      }
    }, findAndModifyConfig).exec();
    portfolio.findOneAndUpdate({
      user_id
    }, {
      $push: {
        posts: data._id
      }
    }, findAndModifyConfig).exec();

    return data;
  });
}