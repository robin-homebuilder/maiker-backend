const mongoose = require("mongoose");

const ContractDocumentSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    name: String,
    document_date: Date,
    file_name: String,
    url: String
  },
  { timestamps: true }
)

const ExtensionOfTimeSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    name: String,
    document_date: Date,
    days_submitted: String,
    status: String,
    file_name: String,
    url: String
  },
  { timestamps: true }
)

const VariationsSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    name: String,
    document_date: Date,
    amount_submitted: String,
    status: String,
    file_name: String,
    url: String
  },
  { timestamps: true }
)

const ContractDocument = mongoose.model("Contract_Document", ContractDocumentSchema);
const ExtensionTime = mongoose.model("Extension_Time", ExtensionOfTimeSchema);
const Variation = mongoose.model("Variation", VariationsSchema);

module.exports = { ContractDocument, ExtensionTime, Variation };