const mongoose = require("mongoose");

const ConsultantSchema = new mongoose.Schema(
  {
    id_number: String,
    name: String,
    licence: String,
    insurance: String,
    insurance_link: String,
    insurance_expiry: Date,
    email: String,
    access: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Client' 
    }]
  },
  { timestamps: true }
);

const Consultant = mongoose.model("Consultant", ConsultantSchema);

module.exports = { Consultant };