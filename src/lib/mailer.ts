import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
}
