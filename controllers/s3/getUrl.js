require("dotenv").config();
const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");

const accessKeyId =  process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const plainTextPassword = process.env.BCRYPT_SECRET;
const rounds = process.env.BCRYPT_ROUNDS;

const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4"
});

// upload url 만듦
module.exports = async (req, res) => {
  const salt = await bcrypt.genSalt(Number(rounds));
  const objName = await bcrypt.hash(plainTextPassword, salt);
  const params = {
    Bucket: bucketName,
    Key: objName.replace(/\/|\./g, "s"),
    Expires: 60
  };
  const uploadUrl = await s3.getSignedUrlPromise(
    "putObject", 
    params
  );
  res.status(201).send({
    data: uploadUrl,
    message: "ok"
  });
};