const Card = require("../models/Card");
const { decrypt } = require("../utils/encryption");
const Payload = require("../utils/Payload");
const { generateToken } = require("../utils/generate-token");
const { getKey } = require("../utils/Keygenerator");
const { cookieencrypt } = require("../utils/Cookie");

// POST /addcard
exports.addCard = async (req, res) => {
  try {
    const { Cardtype } = req.body;

    if (!Cardtype) {
      return res.status(400).json({ error: "Cardtype is required" });
    }

    const allCards = await Card.find();
    const duplicate = allCards.find((card) => {
      const decryptedType = decrypt(card.Cardtype);
      return decryptedType.toLowerCase() === Cardtype.toLowerCase();
    });

    if (duplicate) {
      return res.status(409).json({ error: "Card with this type already exists" });
    }

    const newCard = new Card(req.body);
    await newCard.save();

    res.status(201).json({ message: "Card saved securely" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /:id
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    if (req.body.Cardtype) {
      const otherCards = await Card.find({ _id: { $ne: id } });
      const duplicate = otherCards.find((c) => {
        const decryptedType = decrypt(c.Cardtype);
        return decryptedType.toLowerCase() === req.body.Cardtype.toLowerCase();
      });

      if (duplicate) {
        return res.status(409).json({ error: "Card with this type already exists" });
      }
    }

    await Card.findByIdAndUpdate(id, req.body);
    res.json({ message: "Card updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /:id
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findByIdAndDelete(id);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.json({ message: "Card deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /getcard/:cardname
exports.getCardByType = async (req, res) => {
  try {
    const cards = await Card.find();
    const decryptedCards = cards.map((card) => ({
      _id: card._id,
      Cardnumber: decrypt(card.Cardnumber),
      Cardsecuritycode: decrypt(card.Cardsecuritycode),
      Cardexpirydate: decrypt(card.Cardexpirydate),
      Cardstartdate: decrypt(card.Cardstartdate),
      Cardtype: decrypt(card.Cardtype),
      Cardissuenumber: decrypt(card.Cardissuenumber),
    }));

    const matchedCard = decryptedCards.find(
      (card) => card.Cardtype.toLowerCase() === req.params.cardname.toLowerCase()
    );

    if (!matchedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    const encrypted = Payload.encryptPayload(matchedCard);
    res.json({ payload: encrypted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /decrypt
exports.decryptPayload = async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({ error: "Payload is required" });
    }

    const decryptedData = Payload.decryptPayload(payload);
    res.json({ message: "Payload decrypted successfully", data: decryptedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to decrypt payload", details: err.message });
  }
};

// GET /allcards
exports.getAllCards = async (req, res) => {
  try {
    const cards = await Card.find();
    const decryptedCards = cards.map((card) => ({
      _id: card._id,
      Cardnumber: decrypt(card.Cardnumber),
      Cardsecuritycode: decrypt(card.Cardsecuritycode),
      Cardexpirydate: decrypt(card.Cardexpirydate),
      Cardstartdate: decrypt(card.Cardstartdate),
      Cardtype: decrypt(card.Cardtype),
      Cardissuenumber: decrypt(card.Cardissuenumber),
    }));

    const encryptedPayload = Payload.encryptPayload({ cards: decryptedCards });
    res.json({ message: "All cards retrieved", payload: encryptedPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /injecttoken
exports.injectToken = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer || "";
  const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
  const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed));

  if (!isAllowed) {
    return res.status(403).json({ message: "Forbidden origin" });
  }

  try {
    const token = generateToken();
    const key = getKey();
    const encryptedToken = cookieencrypt(token, key);

    res.cookie("token", encryptedToken, {
      maxAge: 60 * 60 * 1000,
      path: "/",
    }).send("Token Set");
  } catch (error) {
    console.error("Token injection error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
