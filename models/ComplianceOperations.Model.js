const mongoose = require("mongoose");

const DocumentsSchema = new mongoose.Schema(
  {
    name: String,
    document_date: Date,
    file_name: String,
    url: String
  }
)

const ComplianceOperationSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    section_name: String,
    documents: [DocumentsSchema]
  }
)

const ComplianceOperations = mongoose.model("Compliance_Operations", ComplianceOperationSchema);

module.exports = { ComplianceOperations };