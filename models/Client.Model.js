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
    trust_name: String,
    project_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Clients_Project' 
    }
  },
  { timestamps: true }
);

const DocumentsSchema = new mongoose.Schema(
  {
    name: String,
    url: String
  }
)

const ClientProjectSchema = new mongoose.Schema(
  {
    project_id: {
      type: String,
      required: true
    },
    project_no: {
      type: Number,
      required: true
    },
    site_address: String,
    documents: [DocumentsSchema]
  },
  { timestamps: true }
)

const Client = mongoose.model("Client", ClientSchema);
const ClientProject = mongoose.model("Clients_Project", ClientProjectSchema);

module.exports = { Client, ClientProject };