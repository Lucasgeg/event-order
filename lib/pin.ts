import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;
const LOCKOUT_BASE_MS = 60_000;
const LOCKOUT_CAP_MS = 15 * 60_000;

export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(pin, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(pin, salt, expected.length);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/**
 * Durée du verrouillage pour le niveau donné (1 = premier verrouillage) :
 * double à chaque nouvel épisode, plafonné à 15 min.
 */
export function computeLockoutMs(level: number): number {
  if (level <= 0) return 0;
  return Math.min(LOCKOUT_BASE_MS * 2 ** (level - 1), LOCKOUT_CAP_MS);
}
