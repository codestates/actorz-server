const { users } = require("../models");

module.exports = async () => {
  const seedData = {
    email: "kimcoding@gmail.com",
    password: "1234",
    name: "kimcoding",
    company: "코드스테이츠",
    provider: "local",
    gender: true,
    dob: new Date(1999,0,2),
    role: "recruiter",
    careers: [{
      title: "도깨비",
      year: new Date(2016,11,2),
      type: "드라마"
    }],
    recruiter: {
      bName: "코드스테이츠-본점",
      bAddress: {
        city: "서울",
        street: "서초구 서초대로 396",
        zipCode: "06619"
      },
      bEmail: "codestates@gmail.com",
      phoneNum: "010-0000-0000",
      jobTitle: "소프트웨어 개발",
      bNumber: "02-0000-0000",
      bNumberCert: false
    } 
  };
  const userData = await new users(seedData);

  return await userData.save();
}