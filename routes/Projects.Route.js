const express = require("express");

const { 
  getProjectsList,
  getPastProjectsList
} = require("../controllers/Projects.Controller");

const router = express.Router();

router.get("/", getProjectsList);

router.get("/pasts", getPastProjectsList);


module.exports = router;