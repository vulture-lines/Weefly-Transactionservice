const axios = require("axios");
require("dotenv").config();
const { Payment } = require("../models/SISSPPaymentdb");
exports.getTicketDetail = async (req, res) => {
  const ticketId = req.params.ticketId;
  try {
    const doc = await Payment.findOne({
      "TravelfusionBookingDetails.BookingCheckResponse.additionalInfo.SupplierReference":
        ticketId,
    });
    console.log(doc);

    if (doc) {
      const userId = doc.senderid;
      const userService = process.env.USER_SERVICE_URL;
      const userres = await axios.get(`${userService}/get-user/${userId}`, {
        headers: {
          Origin: "http://localhost:3001",
        },
      });

      return res.status(200).json({
        Ticketdetail: doc.TravelfusionBookingDetails,
        UserDetail: userres.data,
      });
    } else {
      return res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    console.error(error);
  }
};
