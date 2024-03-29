const express = require("express");

const { 
  createNewClient
} = require("../controllers/Client.Controller");

const { upload } = require("../helpers/multerUpload.helper");

const router = express.Router();

router.post("/", upload.array('files'), createNewClient);

module.exports = router;