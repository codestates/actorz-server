require("dotenv").config();
const AWS = require("aws-sdk");

const accessKeyId =  process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4"
});

module.exports = (path) => {
  const params = {
    Bucket: bucketName,
    Key: path
  };
  s3.deleteObject(params, (err, data) => {
    if(err) console.log(err);
  });
}