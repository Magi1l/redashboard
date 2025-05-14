import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
  const protectedPaths = ["/dashboard", "/admin"];
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("jwt")?.value;
  if (!token) {
    const loginUrl = new URL("/api/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/api/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}; 