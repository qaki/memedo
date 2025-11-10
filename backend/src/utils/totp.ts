import { TOTP, Secret } from 'otpauth';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { env } from './env-validator';

// Encrypt TOTP secret before storage
export function encryptTOTPSecret(secret: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(env.TOTP_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt TOTP secret
export function decryptTOTPSecret(encryptedSecret: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(env.TOTP_ENCRYPTION_KEY, 'hex');

  const [ivHex, encrypted] = encryptedSecret.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function generateTOTPSecret(email: string) {
  const secret = new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: 'MemeDo',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export async function generateQRCode(uri: string): Promise<string> {
  return await QRCode.toDataURL(uri);
}

export function verifyTOTPToken(encryptedSecret: string, token: string): boolean {
  try {
    const secret = decryptTOTPSecret(encryptedSecret);

    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    // Allow 1 period before/after for clock skew
    const delta = totp.validate({ token, window: 1 });

    return delta !== null;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}
