const mongoose = require("mongoose");

const ConstractSumSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    original_contract_sum: String,
    variation: String,
    revised_contract_sum: String
  },
  { timestamps: true }
);

const ContractSum = mongoose.model("Constract_Sum", ConstractSumSchema);

module.exports = { ContractSum };