import { createHash, randomBytes as generateRandomBytes } from "crypto";

/**
 * Generate a secure random token
 */
export function generateSecureToken(length = 32) {
  return generateRandomBytes(length).toString("hex");
}

/**
 * Hash a token using SHA-256
 */
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a random numeric code (for OTP, etc.)
 */
export function generateNumericCode(length = 6) {
  const digits = "0123456789";
  let code = "";
  const randomBytes = generateRandomBytes(length);

  for (let i = 0; i < length; i++) {
    code += digits[randomBytes[i]! % digits.length];
  }

  return code;
}
