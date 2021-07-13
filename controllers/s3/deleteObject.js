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

module.exports = (media) => {
  const Objects = media.map((data) => {
    const path = data.path.split("%242b%2410%24")[1];
    return {
      Key: "$2b$10$" + path
    }
  })
  const params = {
    Bucket: bucketName, 
    Delete: {
      Objects, 
      Quiet: false
    }
  };
  s3.deleteObjects(params, (err, data) => {
    if(err) console.log(err);
  });
}