const express = require("express");

const { 
  getPackageBySlug
} = require("../controllers/Package.Controller");

const router = express.Router();

router.get("/:slug", getPackageBySlug);

module.exports = router;