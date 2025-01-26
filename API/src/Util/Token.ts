import jwt from "jsonwebtoken";
import Prisma from "../db/prisma";
import { v4 } from "uuid";
// Secret keys for signing tokens (store them securely)
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret";

const _prisma = Prisma.getInstance();

// Generate Access Token (short-lived)
export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" }); // expires in 15 minutes
}

// Generate Refresh Token (long-lived)
export async function generateRefreshToken(userId: string) {
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  }); // expires in 7 days

  const s = v4();

  // change to database function later
  // Store refresh token in the database
  await _prisma.refreshToken.create({
    data: {
      id: s,
      userid: userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return refreshToken;
}

export async function validateRefreshToken(token: String) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

export async function validateAccessToken(token: String) {
  try {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (e) {
    return undefined;
  }
}
