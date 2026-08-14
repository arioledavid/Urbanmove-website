import { randomInt } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/password";

export function generateSixDigitCode(): string {
  return String(randomInt(100000, 1_000_000));
}

export async function hashJobCode(code: string): Promise<string> {
  return hashPassword(code);
}

export async function verifyJobCode(
  code: string,
  codeHash: string,
): Promise<boolean> {
  return verifyPassword(code, codeHash);
}

export function isSixDigitCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}
