const express = require("express");

const { 
  processQuestionnaire
} = require("../controllers/Questionnaire.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

router.post("/", upload.array('files'), processQuestionnaire);

module.exports = router;