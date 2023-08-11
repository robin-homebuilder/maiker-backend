const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    image_base_url: {
      type: String,
      required: true,
    },
    main_image: String,
    other_image: Array
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", ProjectSchema);

module.exports = { Project };