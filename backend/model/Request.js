const mongoose = require("mongoose");
const Request = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  role: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, required: true },
  type: { type: String, required: true },
});
module.exports = mongoose.model("Request", Request, "Request");
