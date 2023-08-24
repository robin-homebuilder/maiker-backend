const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    item_code: String,
    title: {
      type: String,
      required: true
    },
    sub_title: String,
    short_description: String,
    slug: {
      type: String,
      required: true,
    },
    price: Number,
    inclusions: Array,
    note: String
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", PackageSchema);

module.exports = { Package };