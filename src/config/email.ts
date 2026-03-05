import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER } from "./index";
import { HttpError } from "../errors/http-error";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new HttpError(500, "Email service is not configured");
  }

  await transporter.sendMail({
    from: `NutriSphere <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
