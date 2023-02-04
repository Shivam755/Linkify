const mongoose = require("mongoose");
const WorkExperience = new mongoose.Schema({
  DoneBy: { type: String, required: true },
  InstituteId: { type: String },
  InstituteName: { type: String, required: true },
  completed: { type: Boolean, required: true },
  isVerified: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  OfferLetter: { type: String, required: true },
  ReliefLetter: { type: String },
});
module.exports = mongoose.model(
  "WorkExperience",
  WorkExperience,
  "WorkExperience"
);
