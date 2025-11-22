import "dotenv/config";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const FROM_NAME = process.env.FROM_NAME || "Auth API";
const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

let transporter: nodemailer.Transporter;

/**
 * Initialize email transporter
 */
function initializeMailer() {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn(
      "SMTP credentials not configured. Email functionality will not work."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Send email
 */
async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.error("❌ Email not sent - transporter not initialized");
    return false;
  }

  try {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error("❌ Error sending email:", error.message ?? "unexpected error");
    console.error("Full error:", error);
    return false;
  }
}

/**
 * Send email verification email
 */
async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${BASE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(
    email
  )}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${FROM_NAME}!</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${FROM_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, "Verify Your Email Address", html);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(
    email
  )}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${FROM_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, "Reset Your Password", html);
}

/**
 * Send welcome email (after verification)
 */
async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${FROM_NAME}!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name || "there"}!</h2>
          <p>Your email has been verified successfully. You're all set to start using our service!</p>
          <p>Thank you for joining us.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${FROM_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, "Welcome!", html);
}

/**
 * Send OTP email for password reset
 */
async function sendPasswordResetOTPEmail(email: string, otp: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .otp-box { 
          background-color: #fff; 
          border: 2px dashed #FF5722; 
          padding: 30px; 
          text-align: center; 
          margin: 20px 0;
          border-radius: 10px;
        }
        .otp-code { 
          font-size: 36px; 
          font-weight: bold; 
          color: #FF5722; 
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .info { background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset OTP</h1>
        </div>
        <div class="content">
          <h2>Your One-Time Password</h2>
          <p>We received a request to reset your password. Use the OTP below to proceed:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>

          <div class="info">
            <strong>📌 Important:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This OTP is valid for <strong>10 minutes</strong></li>
              <li>You have <strong>5 attempts</strong> to enter the correct OTP</li>
              <li>Do not share this code with anyone</li>
            </ul>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${FROM_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, "Your Password Reset OTP", html);
}

/**
 * Send warehouse member added notification email
 */
async function sendWarehouseMemberAddedEmail(
  email: string,
  userName: string | null,
  warehouseName: string,
  warehouseCode: string,
  role: string,
  addedByName: string | null
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .warehouse-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .role-badge { background-color: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
        .info-item { margin: 12px 0; }
        .info-label { font-weight: bold; color: #64748b; }
        .footer { text-align: center; margin-top: 20px; padding: 20px; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        ul { margin: 15px 0; padding-left: 20px; }
        li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to the Team!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || "there"},</p>
          
          <p>Great news! You've been added to a warehouse in <strong>StockMaster</strong>.</p>

          <div class="warehouse-info">
            <div class="info-item">
              <span class="info-label">Warehouse:</span> <strong>${warehouseName}</strong>
            </div>
            <div class="info-item">
              <span class="info-label">Warehouse Code:</span> <strong>${warehouseCode}</strong>
            </div>
            <div class="info-item">
              <span class="info-label">Your Role:</span> <span class="role-badge">${role}</span>
            </div>
            ${addedByName ? `<div class="info-item"><span class="info-label">Added by:</span> ${addedByName}</div>` : ''}
          </div>

          <h3>What You Can Do:</h3>
          ${role === 'MANAGER' ? `
          <ul>
            <li>✅ Manage warehouse members</li>
            <li>✅ Create and manage products</li>
            <li>✅ Manage warehouse locations</li>
            <li>✅ Perform all stock operations</li>
            <li>✅ View reports and analytics</li>
          </ul>
          ` : `
          <ul>
            <li>✅ View warehouse details</li>
            <li>✅ Perform stock operations (receive, deliver, transfer)</li>
            <li>✅ View products and locations</li>
            <li>✅ View stock levels and movements</li>
          </ul>
          `}

          <p style="margin-top: 30px;">
            <a href="${BASE_URL}/dashboard" class="btn" style="color: white;">Go to Dashboard</a>
          </p>

          <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
            Log in to your account to access the warehouse and start managing inventory!
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} StockMaster. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(
    email,
    `You've been added to ${warehouseName} - StockMaster`,
    html
  );
}

export {
  initializeMailer,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPasswordResetOTPEmail,
  sendWarehouseMemberAddedEmail,
};
