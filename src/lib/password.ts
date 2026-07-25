import { compare, hash } from "bcryptjs";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

export { MIN_PASSWORD_LENGTH };

const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, BCRYPT_COST);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(plain, passwordHash);
}
