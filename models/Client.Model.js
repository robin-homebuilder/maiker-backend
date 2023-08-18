const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    type: String,
    first_name: String,
    last_name: String,
    phone: String,
    email: String,
    company_name: String,
    abn: String,
    trustee_name: String,
    trust_name: String
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", ClientSchema);

module.exports = { Client };