const { portfolio } = require("../../mongodb/models");

module.exports = async (req, res) => {
  try{
    const tokenBodyData = isAuthorized(req);
    if(!tokenBodyData){
      return res.status(401).send({
        data: null,
        message: "Authorization dont exist"
      });
    };

    const { user_id } = req.params;
    const userInfo = await users.findOne({ _id: user_id })
    .catch((err) => null);
    if(!userInfo){
      return res.status(400).send({
        data: null,
        message: "Invalid user ID"
      });
    };

    console.log(userInfo)
    
  }catch(err){
    res.status(500).send({
      data: null,
      message: "Server Error"
    });
  };
};