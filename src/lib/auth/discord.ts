import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { cookies } from "next/headers";

const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

export function getDiscordLoginUrl(state: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
    state,
    prompt: 'consent',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  });
  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) throw new Error('Failed to exchange code for token');
  return res.json();
}

export async function getDiscordUserInfo(access_token: string) {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch Discord user info');
  return res.json();
}

export function signJwt(payload: object, expiresIn: number | string = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as unknown as number | undefined });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// SSR에서 쿠키의 JWT를 파싱해 유저 정보를 반환
export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  if (!token) return null;
  return verifyJwt(token);
} 