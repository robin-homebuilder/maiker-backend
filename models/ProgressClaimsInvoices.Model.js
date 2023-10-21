const mongoose = require("mongoose");

const ProgressClaimsSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    name: String,
    document_date: Date,
    claim_amount: String,
    status: String,
    file_name: String,
    url: String
  },
  { timestamps: true }
)

const InvoicesSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    name: String,
    document_date: Date,
    invoice_amount: String,
    status: String,
    file_name: String,
    url: String
  },
  { timestamps: true }
)

const ProgressClaims = mongoose.model("Progress_Claims", ProgressClaimsSchema);
const Invoices = mongoose.model("Invoices", InvoicesSchema);

module.exports = { ProgressClaims, Invoices };