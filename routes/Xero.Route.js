const express = require("express");

const { 
  processXero
} = require("../controllers/Xero.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

router.post("/", upload.none(), processXero);

module.exports = router;