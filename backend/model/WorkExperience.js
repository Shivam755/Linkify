const mongoose = require("mongoose");
const WorkExperience = new mongoose.Schema({
  DoneBy: { type: String, required: true },
  InstituteId: { type: String },
  InstituteName: { type: String, required: true },
  completed: { type: Boolean, required: true },
  isVerified: { type: Boolean, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  OfferLetter: { type: String, required: true },
  ReliefLetter: { type: String, required: true },
});
module.exports = mongoose.model(
  "WorkExperience",
  WorkExperience,
  "WorkExperience"
);
