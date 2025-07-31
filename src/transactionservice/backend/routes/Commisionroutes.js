const express = require("express");
const router = express.Router();
const commissionController = require("../controller/Commissioncontroller");
const { Secureapi } = require("../middleware/Secureapi");
router.get("/getcommissiondetails", Secureapi ,commissionController.getCommisionDetails);
router.get("/getdetails",Secureapi, commissionController.getDetails);
router.post("/addcommissiondetail",Secureapi, commissionController.addCommissionAndTax);
module.exports = router;
