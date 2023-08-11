const { Package } = require("../models/Package.Model");

exports.getPackageBySlug = async (req, res) => {
  const slug = req.params.slug;
  
  try {

    const packageData = await Package.findOne({ slug: slug });

    res.status(200).json(packageData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
