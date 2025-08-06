const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
// Creating a transporter object
const transPorter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.EMAILPASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const transactionInform = (email, name) => {
  const mailOptions = {
    from: process.env.EMAILUSER,
    to: email,
    subject: "Payment process initiated from your account on WeeFly",
    messageId: `transactioninform-${Date.now()}`,
    inReplyTo: undefined,
    references: undefined,
    html: `
      <strong>Dear ${name},</strong>
      <p>
        We’re letting you know that a <strong>payment process has been initiated</strong> from your account on <strong>WeeFly.</strong> <br> <br>
        This payment request was securely initiated through our tokenized system, which protects your card details during the transaction process.<br>
        If you authorized this transaction, no action is needed.<br> <br>
        If you did not initiate this payment or suspect unauthorized activity, please contact our support team immediately.
      </p>
      <p>
        <strong>Need Help?</strong><br>
        📧 Email: <a href="mailto:support@weefly.africa">support@weefly.africa</a><br>
        📞 Phone: <a href="tel:+2389592388">+238 959 23 88</a>
      </p>
      <p>
        Thank you<br>
        Stay safe,<br>
        <strong>The WeeFly Support Team</strong>
      </p>
    `,
  };

  return new Promise((resolve, reject) => {
    transPorter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error in sending transaction information email:", error);
        reject(error);
      } else {
        console.log("Transaction information email sent:", info.response);
        resolve(info.response);
      }
    });
  });
};

const transactionCancelledByUser = (email, Name) => {
  const mailOptions = {
    from: process.env.EMAILUSER,
    to: email,
    subject: "Your payment request was cancelled",
    messageId: `transactioncancelledbyuser-${Date.now()}`,
    inReplyTo: undefined,
    references: undefined,
    html: `
      <strong>Dear ${Name},</strong>
      <p>
        We’re letting you know that the payment process initiated from your account on <strong>WeeFly</strong> 
        was <strong>cancelled by you</strong> before completion.<br><br>
        No amount was deducted, and the transaction has been safely terminated. <br><br>
        If you did not initiate this cancellation or suspect unauthorized activity, please contact our support team immediately.
      </p>
      <p>
        <strong>Need Help?</strong><br>
        📧 Email: <a href="mailto:support@weefly.africa">support@weefly.africa</a><br>
        📞 Phone: <a href="tel:+2389592388">+238 959 23 88</a>
      </p>
      <p>
        Thank you<br>
        Stay safe,<br>
        <strong>The WeeFly Support Team</strong>
      </p>
    `,
  };

  return new Promise((resolve, reject) => {
    transPorter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(
          "Error in sending transaction cancelled by user email:",
          error
        );
        reject(error);
      } else {
        console.log("Transaction cancelled by user email sent:", info.response);
        resolve(info.response);
      }
    });
  });
};

const transactionCancelledInternal = (email, Name) => {
  const mailOptions = {
    from: process.env.EMAILUSER,
    to: email,
    subject: "Your payment could not be processed",
    messageId: `transactioncancelledinternal-${Date.now()}`,
    inReplyTo: undefined,
    references: undefined,
    html: `
      <strong>Dear ${Name},</strong>
      <p>
        We attempted to process a payment from your account on <strong>WeeFly</strong> 
        but it could not be completed due to an internal error on our system. <br><br>
        No amount has been deducted from your card. Our team is actively looking into the issue to ensure it’s 
        resolved as quickly as possible. <br><br> We apologize for the inconvenience and appreciate your patience.
      </p>
      <p>
        <strong>Need Help?</strong><br>
        📧 Email: <a href="mailto:support@weefly.africa">support@weefly.africa</a><br>
        📞 Phone: <a href="tel:+2389592388">+238 959 23 88</a>
      </p>
      <p>
        Thank you<br>
        Stay safe,<br>
        <strong>The WeeFly Support Team</strong>
      </p>
    `,
  };

  return new Promise((resolve, reject) => {
    transPorter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(
          "Error in sending transaction cancelled internal email:",
          error
        );
        reject(error);
      } else {
        console.log("Transaction cancelled internal email sent:", info.response);
        resolve(info.response);
      }
    });
  });
};

const transactionCancelledExternal = (email, Name) => {
  const mailOptions = {
    from: process.env.EMAILUSER,
    to: email,
    subject: "Your payment could not be processed",
    messageId: `transactioncancelledexternal-${Date.now()}`,
    inReplyTo: undefined,
    references: undefined,
    html: `
      <strong>Dear ${Name},</strong>
      <p>
        A payment attempt from your account on <strong>WeeFly</strong> 
        could not be completed due to a <strong>failure on the bank or payment gateway side.</strong>
        No amount has been deducted from your card. <br><br>You may try the transaction again or use a different 
        payment method. If you continue facing issues, feel free to contact our support team.
      </p>
      <p>
        <strong>Need Help?</strong><br>
        📧 Email: <a href="mailto:support@weefly.africa">support@weefly.africa</a><br>
        📞 Phone: <a href="tel:+2389592388">+238 959 23 88</a>
      </p>
      <p>
        Thank you<br>
        Stay safe,<br>
        <strong>The WeeFly Support Team</strong>
      </p>
    `,
  };

  return new Promise((resolve, reject) => {
    transPorter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error in sending transaction information email:", error);
        reject(error);
      } else {
        console.log("Transaction information email sent:", info.response);
        resolve(info.response);
      }
    });
  });
};

const transactionSuccessful = (email, Name, paymentamount) => {
  const mailOptions = {
    from: process.env.EMAILUSER,
    to: email,
    subject: "Your Payment on WeeFly Was Successful",
    messageId: `transactionsuccessful-${Date.now()}`,
    inReplyTo: undefined,
    references: undefined,
    html: `
      <strong>Dear ${Name},</strong>
      <p>
        We’re pleased to inform you that your payment of <strong>${paymentamount} CVE</strong> on WeeFly has been 
        successfully completed.<br><br>The transaction was securely processed. If you recognize this payment, no further action 
        is required.<br><br>If you did not authorize this transaction or notice anything unusual, please contact our support team immediately.
      </p>
      <p>
        <strong>Need Help?</strong><br>
        📧 Email: <a href="mailto:support@weefly.africa">support@weefly.africa</a><br>
        📞 Phone: <a href="tel:+2389592388">+238 959 23 88</a>
      </p>
      <p>
        Thank you<br>
        Stay safe,<br>
        <strong>The WeeFly Support Team</strong>
      </p>
    `,
  };

  return new Promise((resolve, reject) => {
    transPorter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error in sending transaction information email:", error);
        reject(error);
      } else {
        console.log("Transaction information email sent:", info.response);
        resolve(info.response);
      }
    });
  });
};

module.exports = {
  transactionInform,
  transactionCancelledByUser,
  transactionSuccessful,
  transactionCancelledExternal,
  transactionCancelledInternal,
};
