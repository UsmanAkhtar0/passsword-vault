import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

export type SessionToken = {
  uid: string; // userId as hex
  iat: number;
};

export function signSession(uid: ObjectId): string {
  const payload: SessionToken = { uid: uid.toHexString(), iat: Math.floor(Date.now() / 1000) };
  return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
}

export function verifySession(token: string): SessionToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionToken;
  } catch {
    return null;
  }
}
