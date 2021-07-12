const { redirectUri } = require("../../config");
const { google } = require("googleapis");

module.exports = (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/userinfo.email"
  });

  if(url){
    res.status(200).send({
      data: url,
      message: "ok"
    });
  }else{
    res.status(409).send({
      data: null,
      message: "url not found"
    })
  }
}