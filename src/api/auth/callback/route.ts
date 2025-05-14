import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getDiscordUserInfo, signJwt } from "@/lib/auth/discord";

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUserInfo {
  id: string;
  username: string;
  avatar: string;
  email: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code) return NextResponse.redirect("/");

  try {
    const tokenRes = await exchangeCodeForToken(code) as DiscordTokenResponse;
    const userInfo = await getDiscordUserInfo(tokenRes.access_token) as DiscordUserInfo;
    const jwtToken = signJwt({
      id: userInfo.id,
      username: userInfo.username,
      avatar: userInfo.avatar,
      email: userInfo.email,
    });
    const res = NextResponse.redirect("/dashboard");
    res.cookies.set("jwt", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.redirect("/?error=auth");
  }
} 