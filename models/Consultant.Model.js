const mongoose = require("mongoose");

const ConsultantSchema = new mongoose.Schema(
  {
    id_number: Number,
    name: String,
    licence: String,
    insurance: String,
    insurance_link: String,
    insurance_expiry: Date,
    email: String
  },
  { timestamps: true }
);

const Consultant = mongoose.model("Consultant", ConsultantSchema);

module.exports = { Consultant };