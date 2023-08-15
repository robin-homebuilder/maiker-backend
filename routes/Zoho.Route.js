const express = require("express");

const { 
  createLead
} = require("../controllers/Zoho.Controller");

const router = express.Router();

router.post("/", createLead);

module.exports = router;