const mongoose = require('mongoose');
const { encrypt } = require('../utils/encryption');

const CardSchema = new mongoose.Schema({
  Cardnumber: { type: String, required: true, set: encrypt },
  Cardsecuritycode: { type: String, required: true, set: encrypt },
  Cardexpirydate: { type: String, required: true, set: encrypt },
  Cardstartdate: { type: String, required: true, set: encrypt },
  Cardtype: { type: String, required: true, set: encrypt },
  Cardissuenumber: { type: String, required: true, set: encrypt }
});

module.exports = mongoose.model('Card', CardSchema);
