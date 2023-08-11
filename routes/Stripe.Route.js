const express = require("express");

const { 
  createPaymentIntent,
} = require("../controllers/Stripe.Controller");

const router = express.Router();

router.post("/payment-intent", createPaymentIntent);

module.exports = router;