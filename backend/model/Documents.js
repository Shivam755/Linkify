const mongoose = require("mongoose");
const Documents = new mongoose.Schema({
  docId: { type: String, required: true },
  owner: { type: String, required: true },
  docName: { type: String, required: true },
  docUrl: { type: String, required: true },
  assignedById: { type: String, required: true },
});
module.exports = mongoose.model("Documents", Documents, "Documents");
