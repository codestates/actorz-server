const nodemailer = require("nodemailer");
const { users } = require("../../mongodb/models");
const { isAuthorized } = require("../tokenHandle");

module.exports = async (req, res) => {
  const tokenBodyData = isAuthorized(req);
  if(!tokenBodyData){
    return res.status(401).send({
      data: null,
      message: "Authorization dont exist"
    });
  };

  const { recruiter, actor_id } = req.body;

  const { email } = await users.findOne({ _id: actor_id });
  console.log(email)

  if(!email){
    return res.status(409).send({
      data: null, 
      message: "Actor's email not found"
    });
  }
  

  try{ 
      let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: `"ACTORZ" <${process.env.NODEMAILER_USER}>`,
      to: email,
      subject: `Actorz의 리크루터 ${recruiter.name} (이)가 명함을 보냈습니다`,
      text: `
      ===========================================
      = 회사: ${recruiter.bName}
      = 보낸이: ${recruiter.jobTitle} ${recruiter.name}
      = 이메일: ${recruiter.email}
      = 전화번호: ${recruiter.phoneNum}
      = 주소: ${recruiter.bAddress}
      ===========================================
      = 메시지 =
      ${recruiter.message}
      `,
    });

    console.log(`Message sent: ${info.messageId}`);
  }catch(err){
    return res.status(500).send({
      data: null, 
      message: "SMTP server error"
    });
  }

  res.status(200).json({
    status: "Success",
    code: 200,
    message: "Sent Auth Email",
  });
};