const jwt = require('jsonwebtoken');
require('dotenv').config();
const generateToken=()=>{
const token = jwt.sign({ userId: 'testuser' }, process.env.JWT_KEY, { expiresIn: '1h' });
return token
}

module.exports={generateToken}
