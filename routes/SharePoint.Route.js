const express = require("express");

const { 
  getAccessToken,
  getFormDigestValue,
  fileUploadToSharePoint,
  createAnonymousLink
} = require("../controllers/SharePoint.Controller");

const router = express.Router();

const { upload } = require("../helpers/multerUpload.helper");

router.get("/access_token", getAccessToken);
router.get("/digest_value", getFormDigestValue);
router.post("/upload", upload.array('files'), fileUploadToSharePoint);
router.post("/public_link", createAnonymousLink);

module.exports = router;