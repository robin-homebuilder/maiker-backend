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

const SiteDocumentsSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    documents: [DocumentsSchema]
  }
)

const SiteDocument = mongoose.model("Site_Document", SiteDocumentsSchema);

module.exports = { SiteDocument };