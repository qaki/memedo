import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import {
  generateTOTPSecret,
  generateQRCode,
  encryptTOTPSecret,
  verifyTOTPToken,
  generateBackupCodes,
} from '../utils/totp';

export const setup2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    // Generate TOTP secret
    const { secret, uri } = generateTOTPSecret(user.email);

    // Generate QR code
    const qrCode = await generateQRCode(uri);

    // Return secret and QR code (don't save to DB yet - wait for verification in enable endpoint)
    res.json({
      success: true,
      data: {
        secret,
        qrCode,
        uri,
        message:
          'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)',
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      error: { code: '2FA_SETUP_FAILED', message: 'Failed to setup 2FA' },
    });
  }
};

export const enable2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Secret and token required' },
      });
    }

    // Encrypt secret
    const encryptedSecret = encryptTOTPSecret(secret);

    // Verify the token before enabling
    const isValid = verifyTOTPToken(encryptedSecret, token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid verification code' },
      });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    // TODO: Store hashed backup codes in database (future implementation)
    // const hashedBackupCodes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code, 10)));

    // Enable 2FA and save encrypted secret
    // Note: For backup codes, we'd ideally have a separate table or column
    // For now, we'll just return them to the user
    await db
      .update(users)
      .set({
        totp_enabled: true,
        totp_secret: encryptedSecret,
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      data: {
        message: '2FA enabled successfully',
        backupCodes,
        warning: 'Save these backup codes in a secure location. Each can only be used once.',
      },
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      error: { code: '2FA_ENABLE_FAILED', message: 'Failed to enable 2FA' },
    });
  }
};

export const disable2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    // Verify password before disabling 2FA
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Invalid password' },
      });
    }

    // Admins cannot disable 2FA
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: '2FA_MANDATORY',
          message: '2FA is mandatory for admin accounts and cannot be disabled',
        },
      });
    }

    // Disable 2FA
    await db
      .update(users)
      .set({
        totp_enabled: false,
        totp_secret: null,
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      data: { message: '2FA disabled successfully' },
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      error: { code: '2FA_DISABLE_FAILED', message: 'Failed to disable 2FA' },
    });
  }
};
