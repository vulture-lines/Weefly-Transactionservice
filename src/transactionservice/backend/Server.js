
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv=require("dotenv");
const express = require("express");
const connectDb = require("./config/Db");
const sisproutes=require("./routes/SISPRoutes");
const commissionRoutes=require("./routes/Commisionroutes");
const cardRoutes=require("./routes/Cardroutes");
const ticketDetail=require("./routes/Ticketdetailroute")
const { generateToken } = require("./utils/generate-token");
const app = express();
dotenv.config();
const port = process.env.PORT ;
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://dev.weefly.africa",
  "https://weefly.africa",
  "http://localhost:3001",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
connectDb();
if (process.env.NODE_ENV !== "production") {
  const token=generateToken();
  console.log(token)
}
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header('Access-Control-Allow-Credentials',true);
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.use("/transactionapi",sisproutes);
app.use("/transactionapi",commissionRoutes);
app.use("/transactionapi",cardRoutes);
app.use("/transactionapi",ticketDetail);



app.listen(port, () => {
  console.log(`Transaction Service Server running in http://localhost:${port}`);
});
