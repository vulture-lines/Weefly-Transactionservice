const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const cardController = require("../controller/Cardcontroller");
const { Secureapi } = require("../middleware/Secureapi");

// Route mappings
router.post("/addcard", Secureapi, auth, cardController.addCard);
router.put("/:id", Secureapi, auth, cardController.updateCard);
router.delete("/:id", Secureapi, auth, cardController.deleteCard);
router.get("/getcard/:cardname", Secureapi, auth, cardController.getCardByType);
router.post("/decrypt", Secureapi, auth, cardController.decryptPayload);
router.get("/allcards", Secureapi, auth, cardController.getAllCards);
router.post("/injecttoken", Secureapi, cardController.injectToken);

module.exports = router;
