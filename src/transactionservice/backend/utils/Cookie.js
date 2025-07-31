//Importing Required Libraries
const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();

//Cookie Encrypt function
const cookieencrypt=(data,secretKey)=>{
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

//Cookie decrypt function
const cookiedecrypt = (encryptedData, secretKey) => {
  if (encryptedData && secretKey) {
    try {
      const [ivHex, encrypted] = encryptedData.split(":");
      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(secretKey),
        iv
      );
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
        return "Decryptionerror"
    }
  }
};

module.exports={cookieencrypt,cookiedecrypt}; //Exporting the function to be used in other files