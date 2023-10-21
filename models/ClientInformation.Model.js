const mongoose = require("mongoose");

const ClientDocumentSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    name: String,
    document_date: Date,
    file_name: String,
    url: String
  },
  { timestamps: true }
)

const ClientInformationAdditionalSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    client_name: String,
    phone: String,
    email: String,
    mailing_address: String
  },
  { timestamps: true }
)

const ClientDocument = mongoose.model("Clients_Document", ClientDocumentSchema);
const ClientAdditional = mongoose.model("Clients_Additionals", ClientInformationAdditionalSchema);

module.exports = { ClientDocument, ClientAdditional };