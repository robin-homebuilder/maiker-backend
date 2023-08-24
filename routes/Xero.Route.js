const express = require("express");

const { 
  processXero,
  testAccount
} = require("../controllers/Xero.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

router.post("/", upload.none(), processXero);
router.post("/testAccount", testAccount)

module.exports = router;