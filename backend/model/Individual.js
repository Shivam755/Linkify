const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;
const Individual = new mongoose.Schema({
  _id: { type: String, required: true },
  metamaskId: { type: String, required: true },
  name: { type: String, required: true },
  birthDate: { type: Date, required: true },
  qualification: { type: String, required: true },
  designation: { type: String, required: true },
  password: { type: String, required: true },
  documentList: [ObjectId],
  prevId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

Individual.index({
  name: "text",
  metamskId: "text",
  birthDate: "text",
  createdAt: -1,
});

Individual.pre("save", function (next) {
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

Individual.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
module.exports = mongoose.model("Individual", Individual, "Individual");
