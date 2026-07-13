import { Resend } from "resend";

export const FROM = `Qurious Academy <${process.env.EMAIL_FROM ?? "hello@quriousacademy.com"}>`;
export const ADMIN = process.env.EMAIL_TO ?? "hello@quriousacademy.com";

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Constructed lazily (not at module scope) so importing this file never
  // throws during build-time page-data collection in environments without
  // RESEND_API_KEY set (e.g. preview deploys on branches without the key).
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
}
