const sha512 = require("js-sha512");
const btoa = require("btoa");
const moment = require("moment");
const dotenv = require("dotenv");
const { parseStringPromise } = require("xml2js");
const mongoose = require("mongoose");
const { Countrycode } = require("../utils/Countrycodeconverter");
const { Payment } = require("../models/SISSPPaymentdb");
const {
  transactionInform,
  transactionCancelledByUser,
  transactionCancelledExternal,
  transactionSuccessful,
  transactionCancelledInternalIssue,
} = require("../services/Emailservice");

dotenv.config();
// Test credentials and config
const posID = process.env.POSID;
const posAuthCode = process.env.POSAUTHCODE;
const merchantID = process.env.MERCHANTID;
const currency = process.env.CURRENCY; // Currency code
const transactionCode = process.env.TRANSACTION_CODE; // Purchase operation

// 3DS Server URL (Test)
const threeDSServerUrl = process.env.THREEDS_SERVER_URL;

// 3DS Server URL (Test)
const vinti4CvUrl = process.env.VINTI_FOUR_CV_URL;
const paymentresponseurl = process.env.PAYMENT_RESPONSE_URL;

// Helper functions
function toBase64(u8) {
  return btoa(String.fromCharCode.apply(null, u8));
}

function generateSHA512StringToBase64(input) {
  return toBase64(sha512.digest(input));
}

function generateFingerprintForRequest(
  posAuthCode,
  timestamp,
  amount,
  merchantRef,
  merchantSession,
  posID,
  currency,
  transactionCode,
  entityCode,
  referenceNumber
) {
  const encodedAutCode = generateSHA512StringToBase64(posAuthCode);

  let toHash =
    encodedAutCode +
    timestamp +
    Number(parseFloat(amount) * 1000) +
    merchantRef.trim() +
    merchantSession.trim() +
    posID.trim() +
    currency.trim() +
    transactionCode.trim();

  if (entityCode) toHash += Number(entityCode.trim());
  if (referenceNumber) toHash += Number(referenceNumber.trim());

  console.log("Request fingerprint string to hash:", toHash);

  const fingerprint = generateSHA512StringToBase64(toHash);
  console.log("Generated request fingerprint:", fingerprint);
  return fingerprint;
}

function generateFingerprintForResponse(
  posAuthCode,
  messageType,
  clearingPeriod,
  transactionID,
  merchantReference,
  merchantSession,
  amount,
  messageID,
  pan,
  merchantResponse,
  timestamp,
  reference,
  entity,
  clientReceipt,
  additionalErrorMessage,
  reloadCode
) {
  if (reference) reference = Number(reference);

  if (entity) entity = Number(entity);
  let toHash =
    generateSHA512StringToBase64(posAuthCode) +
    messageType +
    clearingPeriod +
    transactionID +
    merchantReference +
    merchantSession +
    Number(parseFloat(amount) * 1000) +
    messageID.trim() +
    pan.trim() +
    merchantResponse.trim() +
    timestamp +
    reference +
    entity +
    clientReceipt.trim() +
    additionalErrorMessage.trim() +
    reloadCode.trim();

  console.log("Response fingerprint string to hash:", toHash);

  const fingerprint = generateSHA512StringToBase64(toHash);
  console.log("Generated response fingerprint:", fingerprint);
  return fingerprint;
}

// Initiate payment route
exports.startPayment = async (req, res) => {
  const {
    amount,
    email,
    billAddrCountry,
    billAddrCity,
    billAddrline1,
    billAddrline2,
    billAddrPostCode,
    Paymentdate,
    time,
    expectedAmount,
    expectedCurrency,
    TFBookingReference,
    fakeBooking,
    seatOptions,
    senderId,
    outwardFlight,
    returnFlight,
    Travellerdetail,
    Receiptdetails,
  } = req.body;
  console.log(req.body);
  // const amount = "1000";
  const merchantRef = "R" + moment().format("YYYYMMDDHHmmss");
  const merchantSession = "S" + moment().format("YYYYMMDDHHmmss");
  const dateTime = moment().utc().format("YYYY-MM-DD HH:mm:ss");
  const Country = Countrycode(billAddrCountry);
  console.log(Country);
  // URL to receive payment response
  const responseUrl = paymentresponseurl;
  const purchaseRequestJson = {
    threeDSRequestorID: merchantID,
    threeDSRequestorName: "Test Merchant",
    threeDSRequestorURL: threeDSServerUrl,
    threeDSRequestorChallengeInd: "04",
    email: email,
    // addrMatch: "N",
    billAddrCity: billAddrCity,
    billAddrCountry: Country,
    billAddrLine1: billAddrline1,
    billAddrLine2: billAddrline2 ? billAddrline2 : "",
    // billAddrLine3: "",
    billAddrPostCode: billAddrPostCode,
    // billAddrState: "18",
  };

  const purchaseRequestEncoded = btoa(JSON.stringify(purchaseRequestJson));
  const formData = {
    transactionCode,
    posID,
    merchantRef,
    merchantSession,
    amount,
    currency,
    is3DSec: "1",
    urlMerchantResponse: responseUrl,
    languageMessages: "en",
    TimeStamp: dateTime,
    FingerPrintVersion: "1",
    entityCode: "",
    referenceNumber: "",
    purchaseRequest: purchaseRequestEncoded,
  };

  // Generate fingerprint for request
  formData.FingerPrint = generateFingerprintForRequest(
    posAuthCode,
    formData.TimeStamp,
    formData.amount,
    formData.merchantRef,
    formData.merchantSession,
    formData.posID,
    formData.currency,
    formData.transactionCode,
    formData.entityCode,
    formData.referenceNumber
  );

  console.log("Sending formData to 3DS Server:", formData);

  var postURL =
    `${threeDSServerUrl}?FingerPrint=` +
    encodeURIComponent(formData.FingerPrint) +
    "&TimeStamp=" +
    encodeURIComponent(formData.TimeStamp) +
    "&FingerPrintVersion=" +
    encodeURIComponent(formData.FingerPrintVersion);

  // Build auto-submit form
  let formHtml =
    "<html><head><title>Payment vinti4 Test</title></head><body onload='autoPost()'>";
  formHtml += `<form action="${postURL}" method="post">`;
  Object.keys(formData).forEach((key) => {
    formHtml += `<input type="hidden" name="${key}" value="${formData[key]}">`;
  });
  formHtml += "</form>";
  formHtml +=
    "<script>function autoPost(){document.forms[0].submit();}</script>";
  formHtml += "</body></html>";
  console.log(typeof formHtml);
  const objectId = new mongoose.Types.ObjectId(senderId);
  try {
    await Payment.create({
      transactionid: "PATX" + time,
      paymentdate: Paymentdate,
      paymentamount: amount,
      senderemail: email,
      senderid: objectId,
      billAddrCountry: Country,
      billAddrCity: billAddrCity,
      billAddrLine1: billAddrline1,
      billAddrLine2: billAddrline2 ? billAddrline2 : "",
      billAddrPostCode: billAddrPostCode,
      merchantSession: merchantSession,
      Recievername: "Weefly",
      Paymentresponse: "Pending",
      Paymentstatus: "Pending", // give default valid value
      Refundstatus: "None", // give default valid value
      TravelfusionBookingDetails: {
        expectedAmount,
        expectedCurrency,
        TFBookingReference,
        fakeBooking,
        ...(Array.isArray(seatOptions) &&
          seatOptions.length > 0 && {
            seatOptions: seatOptions,
          }),
        outwardFlight: outwardFlight,
        ...(returnFlight &&
          Object.keys(returnFlight).length > 0 && {
            returnFlight: returnFlight,
          }),
        Travellerdetails: Travellerdetail,
        Receiptdetails: Receiptdetails,
      },
    });
    try {
      console.log("User service API call");

      const latestPayment = await Payment.findOne().sort({ _id: -1 });
      const userId = latestPayment.senderid;
      const userService = process.env.USER_SERVICE_URL;
      const userres = await fetch(`${userService}/getuser/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3001",
        },
      });
      if (!userres.ok) {
        return console.error("Couldn't find user!!", userres);
      } else {
        const user = await userres.json();
        const email = user.userdetail.Emailaddress;
        const name = user.userdetail.Name;
        transactionInform(email, name);
      }
    } catch (error) {
      return console.log("error in getting user details", error);
    }
  } catch (error) {
    console.error(error);
  }

  res.send(formHtml);
};

// Payment response endpoint to validate response fingerprint
exports.Paymentresponse = async (req, res) => {
  let Paymentstatus;
  let user;
  const successMessageTypes = ["8", "10", "M", "P"];
  const body = req.body;
  console.log("Payment response received:", body);
  const travelFusionApi = process.env.FLIGHT_API;
  try {
    console.log("User service API call");

    const latestPayment = await Payment.findOne().sort({ _id: -1 });
    const userId = latestPayment.senderid;
    const userService = process.env.USER_SERVICE_URL;
    const userres = await fetch(`${userService}/getuser/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3001",
      },
    });
    if (!userres.ok) {
      return console.error("Couldn't find user!!", userres);
    } else {
      user = await userres.json();
    }
  } catch (error) {
    return console.log("error in getting user details", error);
  }
  if (successMessageTypes.includes(body.messageType)) {
    const calculatedFingerprint = generateFingerprintForResponse(
      posAuthCode,
      body.messageType,
      body.merchantRespCP,
      body.merchantRespTid,
      body.merchantRespMerchantRef,
      body.merchantRespMerchantSession,
      body.merchantRespPurchaseAmount,
      body.merchantRespMessageID,
      body.merchantRespPan,
      body.merchantResp,
      body.merchantRespTimeStamp,
      body.merchantRespReferenceNumber,
      body.merchantRespEntityCode,
      body.merchantRespClientReceipt,
      body.merchantRespAdditionalErrorMessage,
      body.merchantRespReloadCode
    );

    if (body.resultFingerPrint === calculatedFingerprint) {
      Paymentstatus = "success";
      try {
        await Payment.findOneAndUpdate(
          { merchantSession: body.merchantRespMerchantSession },
          {
            Paymentresponse: body,
            Paymentstatus: Paymentstatus,
          }
        );
        const updatedPayment = await Payment.findOne().sort({ _id: -1 });
        const bookingDetails = updatedPayment.TravelfusionBookingDetails;
        console.log("Intiating Booking Process!!", bookingDetails);
        const startBookingResult = await fetch(
          `${travelFusionApi}/start-booking`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bookingDetails),
          }
        );

        const responseText = await startBookingResult.text();
        const contentType = startBookingResult.headers.get("content-type");

        let startBookingData;
        let TFBookingReference;

        try {
          if (contentType?.includes("application/json")) {
            startBookingData = JSON.parse(responseText);
            console.log(startBookingData);
            TFBookingReference = startBookingData.bookingReference;
          } else if (
            contentType?.includes("application/xml") ||
            contentType?.includes("text/xml")
          ) {
            const parsedXml = await parseStringPromise(responseText);
            startBookingData = parsedXml;
            console.log(parsedXml);
          } else {
            console.error("Unsupported content-type:", contentType);
            console.error("Raw response from start-booking:", responseText);
            throw new Error("Unsupported content-type: " + contentType);
          }

          if (!TFBookingReference) {
            throw new Error("TFBookingReference not found in parsed response");
          }

          console.log("start-booking TFBookingReference:", TFBookingReference);
        } catch (err) {
          console.error("Failed to parse start-booking response:", err.message);
          return res.status(502).json({
            error: "Invalid start-booking response",
            details: err.message,
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 10000));

        console.log("Checking Booking status");
        const checkBookingResponse = await fetch(
          `${travelFusionApi}/check-booking`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ TFBookingReference }),
          }
        );

        const checkBookingResult = await checkBookingResponse.json();
        console.log("check-booking response", checkBookingResult);
        const bookingStatus = checkBookingResult.additionalInfo.Status[0];
        console.log(
          `Booking status: ${checkBookingResult.additionalInfo.Status[0]}`
        );
        await Payment.findOneAndUpdate(
          { merchantSession: body.merchantRespMerchantSession },
          {
            $set: {
              "TravelfusionBookingDetails.BookingStatus": bookingStatus,
              "TravelfusionBookingDetails.BookingCheckResponse":
                checkBookingResult, // optional
            },
          }
        );
        function formatDateToLocalMinute(date) {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const hours = String(d.getHours()).padStart(2, "0");
          const minutes = String(d.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        const now = formatDateToLocalMinute(new Date());

        const status = bookingStatus.toLowerCase();
        const bookid = checkBookingResult.additionalInfo.SupplierReference[0];
        let latestPayment;
        try {
          console.log("User service API call");

          latestPayment = await Payment.findOne().sort({ _id: -1 });
          const userId = latestPayment.senderid;
          const userService = process.env.USER_SERVICE_URL;
          const details = {
            paymentid: latestPayment._id,
            TravelfusionBookingDetail: latestPayment.TravelfusionBookingDetails,
            TFBookingon: now,
          };
          const userres = await fetch(`${userService}/update-user/${userId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Origin: "http://localhost:3001",
            },
            body: JSON.stringify({
              details,
            }),
          });
          if (!userres.ok) {
            return console.error("Couldn't update user!!", userres);
          }
        } catch (error) {
          return console.log(error);
        }
        const email = user.userdetail.Emailaddress;
        const Name = user.userdetail.Name;
        const paymentamount = latestPayment.Paymentresponse.dccAmount
          ? latestPayment.Paymentresponse.dccAmount
          : latestPayment.paymentamount;
        const paymentcurrency = latestPayment.Paymentresponse.dccAmount
          ? latestPayment.Paymentresponse.dccCurrency
          : "CVE";
        switch (status) {
          case "succeeded":
            transactionSuccessful(email, Name, paymentamount,paymentcurrency);
            res.status(201).redirect(`${process.env.SUCCESS_URL}/${bookid}`);
            break;

          case "failed":
            res.status(500).redirect(process.env.UNSUCCESS_URL);
            break;

          case "bookinginprogress":
            res.status(202).redirect(process.env.UNCONFIRMED_URL);
            break;

          case "unconfirmed":
            res.status(202).redirect(process.env.UNCONFIRMED_URL);
            break;

          case "unconfirmedbysupplier":
            res.status(202).redirect(process.env.UNCONFIRMED_SUPPLIER_URL);
            break;

          default:
            res.status(400).redirect(process.env.ERROR_URL);
            break;
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      Paymentstatus = "failure";
      try {
        await Payment.findOneAndUpdate(
          { merchantSession: body.merchantRespMerchantSession },
          {
            Paymentresponse: body,
            Paymentstatus: Paymentstatus,
          }
        );
        const email = user.userdetail.Emailaddress;
        const Name = user.userdetail.Name;
        transactionCancelledInternalIssue(email, Name);
        res
          .status(422)
          .redirect(process.env.PAYMENT_TRANSACTION_INTERNAL_ERROR_URL);
      } catch (error) {
        console.error(error + "f");
      }
    }
  } else if (body.UserCancelled === "true") {
    Paymentstatus = "UserCancelled Payment";
    try {
      await Payment.findOneAndUpdate(
        { merchantSession: body.merchantSession },
        {
          Paymentresponse: body,
          Paymentstatus: Paymentstatus,
        }
      );
      const email = user.userdetail.Emailaddress;
      const Name = user.userdetail.Name;
      transactionCancelledByUser(email, Name);
      res
        .status(500)
        .redirect(process.env.PAYMENT_TRANSACTION_USER_CANCELLED_URL);
    } catch (error) {
      console.error(error);
    }
  } else {
    Paymentstatus = "SISP Failed Payment";
    try {
      const paymentDetail = await Payment.findOne().sort({ _id: -1 });
      paymentDetail.Paymentstatus = Paymentstatus;
      paymentDetail.Paymentresponse = body;
      await paymentDetail.save();
      const email = user.userdetail.Emailaddress;
      const Name = user.userdetail.Name;
      transactionCancelledExternal(email, Name);
      res
        .status(500)
        .redirect(process.env.PAYMENT_TRANSACTION_EXTERNAL_ERROR_URL);
    } catch (error) {
      console.error(error);
    }
  }
};

exports.getPaymentDetails = async (req, res) => {
  const SupplierReference = req.params.id;
  try {
    const result = await Payment.findOne({
      "TravelfusionBookingDetails.BookingCheckResponse.additionalInfo.SupplierReference":
        SupplierReference,
    });

    if (!result) {
      return res
        .status(404)
        .json({ message: "No record found for the given Supplier Reference." });
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
