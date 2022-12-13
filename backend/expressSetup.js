const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const session = require("./middlewares/session");
const passport = require("./middlewares/auth");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(session);
app.use(passport.initialize());
// app.use(passport.session());
module.exports = {
  app,
};
