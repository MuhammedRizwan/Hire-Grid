// services/email.service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
}

export const emailTemplates = {
  application: (companyName: string, position: string, name: string) => ({
    subject: `Application for ${position} position at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Job Application</h2>
        <p>Dear Hiring Manager,</p>
        <p>I am writing to express my interest in the <strong>${position}</strong> position at <strong>${companyName}</strong>.</p>
        <p>Please find my resume attached for your review. I am excited about the opportunity to contribute to your team.</p>
        <p>Thank you for your time and consideration.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>${name}</strong></p>
      </div>
    `,
  }),
  
  followUp: (companyName: string, position: string, name: string) => ({
    subject: `Follow-up on ${position} application at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Follow-up on Job Application</h2>
        <p>Dear Hiring Manager,</p>
        <p>I wanted to follow up on my application for the <strong>${position}</strong> position at <strong>${companyName}</strong>.</p>
        <p>I remain very interested in this opportunity and would love to discuss how my skills could benefit your team.</p>
        <p>Please let me know if you need any additional information from me.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>${name}</strong></p>
      </div>
    `,
  }),
};

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...options,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: String(error) };
  }
}