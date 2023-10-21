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

const AuthorityApprovalSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    section_name: String,
    documents: [DocumentsSchema]
  }
)

const AuthorityApprovals = mongoose.model("Authority_Approvals", AuthorityApprovalSchema);

module.exports = { AuthorityApprovals };