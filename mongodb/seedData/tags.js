const { tags } = require("../models");

module.exports = async () => {
  const seedData = {
    tag: "도깨비"
  };
  const tagData = await new tags(seedData);

  return await tagData.save();
}