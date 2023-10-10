const express = require("express");

const { 
  login
} = require("../controllers/Authentication.Controller");

const router = express.Router();

router.post("/login", login);

module.exports = router;