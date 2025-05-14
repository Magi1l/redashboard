import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || process.env.JWT_SECRET;

// document.cookie에서 jwt 쿠키 추출
function getJwtFromCookie() {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|; )jwt=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getClientUser() {
  const token = getJwtFromCookie();
  if (!token || !JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getClientUser();
}

export function logout() {
  if (typeof document !== "undefined") {
    document.cookie = "jwt=; path=/; max-age=0;";
    window.location.href = "/api/auth/login";
  }
} 