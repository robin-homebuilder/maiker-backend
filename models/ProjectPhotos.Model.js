const mongoose = require("mongoose");

const ProjectPhotosSchema = new mongoose.Schema(
  {
    client_id: mongoose.Schema.Types.ObjectId,
    file_name: String,
    url: String
  },
  { timestamps: true }
)

const ProjectPhotos = mongoose.model("Project_Photos", ProjectPhotosSchema);

module.exports = { ProjectPhotos };