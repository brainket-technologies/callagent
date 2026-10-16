import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt with salt
 */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a stored bcrypt hash
 */
export async function verifyPassword(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainTextPassword || !hashedPassword) return false;
  return bcrypt.compare(plainTextPassword, hashedPassword);
}
