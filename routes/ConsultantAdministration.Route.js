const express = require("express");

const router = express.Router();

const { 
  getClients,
  getSearchClients
} = require("../controllers/ConsultantAdministration.Controller");

router.get("/clients/:consultantID", getClients)

router.post("/clients/search", getSearchClients)

module.exports = router;