const { Project } = require("../models/Projects.Model");

exports.getProjectsList = async (req, res) => {
  try {
    const projects = await Project.find({}).select("-_id title image_base_url main_image other_image");

    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getPastProjectsList = async (req, res) => {
  try {
    const projects = await Project.find({}).select("-_id title image_base_url main_image other_image").limit(4);

    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}