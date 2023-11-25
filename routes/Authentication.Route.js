const express = require("express");

const { 
  login,
  getUserCredential,
  saveUserCredential
} = require("../controllers/Authentication.Controller");

const router = express.Router();

router.get("/credential/:userID", getUserCredential);

router.post("/login", login);
router.post("/credential", saveUserCredential);

module.exports = router;