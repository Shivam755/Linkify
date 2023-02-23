const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Education = new mongoose.Schema({
  course: { type: String, required: true },
  DoneBy: { type: String, required: true },
  InstituteId: { type: String },
  InstituteName: { type: String, required: true },
  isVerified: { type: String, required: true },
  completed: { type: Boolean, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  CreditsGained: { type: Number },
  finalGrade: { type: Number },
  finalGradeUnit: { type: String },
  finalMarksheet: { type: ObjectId },
});
module.exports = mongoose.model("Education", Education, "Education");
