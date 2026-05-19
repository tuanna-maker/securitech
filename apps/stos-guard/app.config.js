const appJson = require("./app.json");

module.exports = () => ({
  ...appJson.expo,
  owner: "tuanna-unicom",
});
