var express = require("express");
var router = express.Router();

function homePage(req, res) {
  res.render("map", {
    title: "UWC Map",
  });
}

router.all("*", homePage);

module.exports = router;
