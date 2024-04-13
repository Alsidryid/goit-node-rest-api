import nodemailer from "nodemailer";
import "dotenv/config";

const { UKNET_PASSWORD, UKNET_EMAIL } = process.env;

const nodemailerConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: UKNET_EMAIL,
    pass: UKNET_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = (data) => {
  const email = { ...data, from: UKNET_EMAIL };
  return transport.sendMail(email);
};

export default sendEmail;
