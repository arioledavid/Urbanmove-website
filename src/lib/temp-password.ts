import { randomBytes } from "node:crypto";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

/** Avoid ambiguous characters (0/O, 1/l/I) for phone-friendly temp passwords. */
const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

export function generateTemporaryPassword(
  length = Math.max(16, MIN_PASSWORD_LENGTH),
): string {
  const bytes = randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += PASSWORD_ALPHABET[bytes[i]! % PASSWORD_ALPHABET.length]!;
  }
  return password;
}
