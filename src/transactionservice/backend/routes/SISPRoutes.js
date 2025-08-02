const express = require("express");
const router = express.Router();
const PaymentController = require("../controller/SISPController");
const { Secureapi } = require("../middleware/Secureapi");
router.post("/start-payment", PaymentController.startPayment);
router.post("/payment-response", PaymentController.Paymentresponse);
router.get("/getpaymentdetail/:id",Secureapi,PaymentController.getPaymentDetails);
module.exports = router ;
