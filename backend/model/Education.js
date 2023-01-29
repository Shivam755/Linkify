const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Education = new mongoose.Schema({
  course: { type: String, required: true },
  DoneBy: { type: String, required: true },
  InstituteId: { type: String },
  InstituteName: { type: String, required: true },
  isVerified: { type: Boolean, required: true },
  completed: { type: Boolean, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  CreditsGained: { type: Number, required: true },
  finalGrade: { type: Number, required: true },
  finalGradeUnit: { type: String, required: true },
  finalMarksheet: { type: ObjectId, required: true },
});
module.exports = mongoose.model("Education", Education, "Education");
