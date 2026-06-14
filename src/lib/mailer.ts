import nodemailer from "nodemailer";

// Shared transporter — Zoho SMTP
export function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_FROM, // hello@quriousacademy.com
      pass: process.env.EMAIL_PASS, // Zoho app password
    },
  });
}

export const FROM = `"Qurious Academy" <${process.env.EMAIL_FROM ?? "hello@quriousacademy.com"}>`;
export const ADMIN = process.env.EMAIL_TO ?? "prasant@quriousacademy.com";
