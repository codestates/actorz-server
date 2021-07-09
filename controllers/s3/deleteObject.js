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

module.exports = (medias) => {
  const Objects = medias.map((media) => {
    const pathToArr = media.path.split("/");
    return {
      Key: pathToArr[pathToArr.length - 1]
    }
  })
  const params = {
    Bucket: bucketName, 
    Delete: {
      Objects, 
      Quiet: false
    }
  };
  s3.deleteObject(params, (err, data) => {
    if(err) console.log(err);
  });
}