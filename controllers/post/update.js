const { posts } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  try{

  }catch(err){
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  }
};