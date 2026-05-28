import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function POST(req) {
  try {
    const { signIn } = await import("next-auth/react");
    return NextResponse.redirect(
      new URL(
        `/signin?demo=true`,
        req.url
      )
    );
  } catch (error) {
    return NextResponse.redirect(new URL("/signin?demo=true", req.url));
  }
}