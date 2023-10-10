const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    type: String,
    account_id: mongoose.Schema.Types.ObjectId,
    user_email: {
      type: String,
      required: true,
      min: 5,
      max: 50
    },
    user_pass: {
      type: String,
      required: true,
      min: 8,
      max: 50,
    },
    user_role: Number,
    status: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };