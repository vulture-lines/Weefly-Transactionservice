const jwt = require("jsonwebtoken");
const { cookiedecrypt } = require("../utils/Cookie");
const { getKey } = require("../utils/Keygenerator");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // if (process.env.NODE_ENV !== "production") {
    //   const decoded = jwt.verify(token, process.env.JWT_KEY);
    //   if(decoded){
    //     next()
    //   }
    // }
    // else{
      const encrypted=token
      const key=getKey();
      const data=cookiedecrypt(encrypted,key)
      const decoded = jwt.verify(data, process.env.JWT_KEY);
      if(decoded){
        next()
      }
    // }
  } catch(error) {
    console.log(error)
    res.status(401).json({ message: "Invalid token" });
  }
};
