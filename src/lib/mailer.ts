import nodemailer from "nodemailer";

// Shared transporter — GoDaddy SMTP
export function createTransporter() {
  return nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export const FROM = `"Qurious Academy" <${process.env.EMAIL_FROM ?? "hello@quriousacademy.com"}>`;
export const ADMIN = process.env.EMAIL_TO ?? "prasant@quriousacademy.com";
