const { users } = require("../models");

module.exports = async () => {
  const seedData = {
    email: "kimcoding@gmail.com",
    password: "1234",
    name: "kimcoding",
    provider: "local",
    gender: true,
    dob: 99-01-01,
    careers: [{
      title: "도깨비",
      year: 16-12-01,
      type: "판타지"
    }],
    recruitor: {
      bName: "코드스테이츠-본점",
      bAddress: {
        city: "서울",
        street: "강남",
        zipCode: "11111"
      },
      bEmail: "codestates@gmail.com",
      phoneNum: "02-0000-0000",
      jobTitle: "학원"
    }
  };
  const userData = await new users(seedData);

  return await userData.save();
}