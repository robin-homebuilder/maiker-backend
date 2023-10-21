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
    },
    project_number: String,
    project_status: {
      type: Number,
      default: 301
    }
  },
  { timestamps: true }
);

const DocumentsSchema = new mongoose.Schema(
  {
    name: String,
    file_name: String,
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
    description: String,
    site_area: String,
    local_government: String,
    documents: [DocumentsSchema]
  },
  { timestamps: true }
)

const ClientConsultantsSchema = new mongoose.Schema(
  {
    client_id: String,
    consultant_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Consultant' 
    }
  },
  { timestamps: true }
)

const Client = mongoose.model("Client", ClientSchema);
const ClientProject = mongoose.model("Clients_Project", ClientProjectSchema);
const ClientConsultant = mongoose.model("Clients_Consultant", ClientConsultantsSchema);

module.exports = { Client, ClientProject, ClientConsultant };