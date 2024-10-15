var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var multer = require("multer");
var fs = require("fs");

var indexRouter = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/getUserData", (req, res) => {
  fs.readFile("users.json", "utf8", function (err, userData) {
    res.setHeader("Content-Type", "application/json");
    res.json(userData);
  });
});

// Configure multer for file uploads
var upload = multer();

app.post("/submit", upload.none(), function (req, res, next) {
  var name = String(req.body.name);
  var latitude = parseFloat(req.body.latitude);
  var longitude = parseFloat(req.body.longitude);

  // Validate that latitude and longitude are valid floats
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).send("Invalid latitude or longitude");
  }

  // Create the marker data with properly parsed float values
  var markerData = {
    name: name,
    latitude: latitude,
    longitude: longitude,
  };

  // Read and update the users.json file
  fs.readFile("users.json", "utf8", function (err, data) {
    if (err) {
      console.log("error reading file", err);
      res.status(500).send("Failed to read user data file");
    }

    var markers;
    try {
      markers = JSON.parse(data); // Attempt to parse JSON data
    } catch (error) {
      console.error("Failed to parse JSON data:", error);
      markers = []; // Initialize empty array if JSON is invalid
    }

    // Add the new marker data to the existing array
    markers.push(markerData);
    console.log("updated markers", markers);

    // Write the updated array back to the file
    fs.writeFile("users.json", JSON.stringify(markers), function (err) {
      if (err) {
        console.error("Error writing to file", err);
        return res.status(500).send("Failed to save data");
      }

      res.redirect("/");
    });
  });
});

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
