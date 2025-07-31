// Function to secure API based on the origin of the request
const Secureapi = async (req, res, next) => {
  try {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://dev.weefly.africa",
      "https://weefly.africa",
      "http://localhost:3001",
      "http://localhost:3000",
    ];

    // Storing the request origin
    const requestOrigin = req.headers.origin || req.headers.referer;

    // No Origin or Referer => Block the request
    if (!requestOrigin) {
      return res.status(403).json({ message: "Unauthorized Access" });
    }

    // Trimming the unwanted Request Path
    const originURL = requestOrigin.split("/").slice(0, 3).join("/");

    // Not allowed Origin or Referer => Block the request
    if (!allowedOrigins.includes(originURL)) {
      return res.status(403).json({ message: "Unauthorized Access" });
    }
    // Allowed origin proceed with the request
    next();
  } catch (error) {
    // console.log("Error in Secureapi middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { Secureapi };
