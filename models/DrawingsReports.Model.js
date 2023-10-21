const mongoose = require("mongoose");

const DocumentsSchema = new mongoose.Schema(
  {
    name: String,
    document_date: Date,
    amendment: String,
    file_name: String,
    url: String
  }
)

const DrawingsReportsSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    section_name: String,
    documents: [DocumentsSchema]
  }
)

const DrawingsReports = mongoose.model("Drawings_Reports", DrawingsReportsSchema);

module.exports = { DrawingsReports };