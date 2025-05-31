// File: lib/email.ts

// Example using Resend (you can replace with your preferred email service)
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: "TaskForPerks <noreply@taskforperks.com>", // Replace with your domain
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #4f46e5; text-align: center;">Welcome to TaskForPerks!</h1>
          <p>Hi ${firstName},</p>
          <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">TaskForPerks - Trading tasks for perks</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}

// Alternative implementation using Nodemailer (if you prefer)
/*
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email address",
    html: `... same HTML template as above ...`,
  });
}
*/