const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const Individual = require("../model/Individual");
const Institute = require("../model/Institute");
const passport = require("passport");

let opts = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
};

passport.use(
  new JwtStrategy(opts, (payload, done) => {
    if (payload.type === "Individual") {
      Individual.findOne({ _id: payload._id }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    } else {
      Institute.findOne({ _id: payload._id }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    }
  })
);

module.exports = passport;
