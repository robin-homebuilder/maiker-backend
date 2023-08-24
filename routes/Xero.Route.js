const express = require("express");

const { 
  processXero,
  testAccount,
  testProject,
  testInvoice,
  testPaidInvoice,
  testSendInvoice
} = require("../controllers/Xero.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

router.post("/", upload.none(), processXero);
router.post("/testAccount", testAccount)
router.post("/testProject", testProject)
router.post("/testInvoice", testInvoice)
router.post("/testPaidInvoice", testPaidInvoice)
router.post("/testSendInvoice", testSendInvoice)

module.exports = router;