import { Resend } from 'resend';
import { env } from '../utils/env-validator';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

  try {
    await resend.emails.send({
      from: env.FROM_EMAIL || 'noreply@meme-do.com',
      to: email,
      subject: 'Verify your MemeDo account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to MemeDo!</h1>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

  try {
    await resend.emails.send({
      from: env.FROM_EMAIL || 'noreply@meme-do.com',
      to: email,
      subject: 'Reset your MemeDo password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Password Reset Request</h1>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; word-break: break-all;">${resetUrl}</p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
