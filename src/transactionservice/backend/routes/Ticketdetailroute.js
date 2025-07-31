const express=require("express");
const router=express.Router();
const ticketDetail=require("../controller/Ticketdetailcontroller");
const { Secureapi } = require("../middleware/Secureapi");
router.get("/getticketdetail/:ticketId",Secureapi,ticketDetail.getTicketDetail);
module.exports=router