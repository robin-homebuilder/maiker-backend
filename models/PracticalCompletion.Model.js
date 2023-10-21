const mongoose = require("mongoose");

const PracticalCompletionSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    original_practical_completion: Date,
    approved_extension_of_time: String,
    revised_practical_completion: Date
  },
  { timestamps: true }
);

const PracticalCompletion = mongoose.model("Practical_Completion", PracticalCompletionSchema);

module.exports = { PracticalCompletion };