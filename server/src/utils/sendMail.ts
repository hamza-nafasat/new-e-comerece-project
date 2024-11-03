import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: Number(process.env.NODEMAILER_PORT),
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendMail = async (to: string, subject: string, text: string, html = false) => {
  try {
    if (!to || !subject || !text) throw new Error("Please Provide To, Subject and Text");
    const myTransPorter: any = transporter;
    await myTransPorter.sendMail({
      from: process.env.NODEMAILER_FROM,
      to,
      subject,
      text: html ? undefined : text,
      html: html ? text : undefined,
    });
    return true;
  } catch (error) {
    console.log("error while sending mail", error);
    return false;
  }
};
