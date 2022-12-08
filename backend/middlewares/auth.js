const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const Individual = require("../model/Individual");
const passport = require("passport");

// var sessionExtractor = function (req) {
//   var token = null;
//   console.log(req.session);
//   if (req && req.session) {
//     token = req.session.authToken;
//   }
//   console.log(token);
//   return token;
// };

let opts = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  jsonWebTokenOptions: {
    maxAge: "2d",
  },
};

passport.use(
  new JwtStrategy(opts, (payload, done) => {
    console.log(payload);
    console.log(User);
    // return done(null, payload);
    Individual.findOne({ id: payload.sub }, function (err, user) {
      if (err) {
        console.log(payload);
        return done(err, false);
      }
      if (user) {
        console.log(payload);
        return done(null, user);
      } else {
        console.log(payload);
        return done(null, false);
        // or you could create a new account
      }
    });
  })
);

module.exports = passport;
// const jwt = require("jsonwebtoken");

// const verifyToken = (req, res, next) => {
//   const token =
//     req.body.token || req.query.token || req.headers["x-access-token"];
//   console.log(token);
//   if (!token) {
//     return res.status(403).send("A token is required for authentication");
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log(decoded);
//     req.user = decoded;
//   } catch (err) {
//     return res.status(401).send("Invalid Token");
//   }
//   return next();
// };

// module.exports = verifyToken;
