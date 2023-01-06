const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;
const Institute = new mongoose.Schema({
  _id: { type: String, required: true },
  metamaskId: { type: String, required: true },
  name: { type: String, required: true },
  foundationDate: { type: Date, required: true },
  ceoId: { type: String, required: true },
  instituteType: { type: String, required: true },
  roles: [String],
  password: { type: String, required: true },
  location: { type: mongoose.Schema.Types.Map, required: true },
  prevId: { type: String, required: true },
});

Institute.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

Institute.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
module.exports = mongoose.model("Institute", Institute, "Institute");
