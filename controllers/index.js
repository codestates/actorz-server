module.exports = {
  user: {
    login: require("./user/login"),
    logout: require("./user/logout"),
    signup: require("./user/signup"),
    info: require("./user/info"),
    delete: require("./user/delete"),
    update: require("./user/update")
  },
  oauth: {
    googleUrl: require("./oauth/googleUrl"),
    googleLogin: require("./oauth/googleLogin"),
    naverLogin: require("./oauth/naverLogin"),
  },
  like: {
    myLike: require("./like/myLike")
  },
  post: {
    myPost: require("./post/myPost"),
    create: require("./post/create"),
    delete: require("./post/delete"),
    update: require("./post/update"),
    getPost: require("./post/getPost"),
    getPostList: require("./post/getPostList"),
    postLike: require("./post/postLike"),
    postUnLike: require("./post/postUnLike"),
    postIsLike: require("./post/postIsLike") // 필요?
  },
  search: {
    search: require("./search/search")
  }, // filtering 나눔?
  portfolio: {
    info: require("./portfolio/info"),
    create: require("./portfolio/create"),
    update: require("./portfolio/update"),
    delete: require("./portfolio/delete")
  },
  s3: {
    getUrl: require("./s3/getUrl")
  }
};