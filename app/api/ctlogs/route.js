import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { fetchCTLogs, analyzeCTLogs } from "../../../lib/ctlog";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const hostname = searchParams.get("hostname");

    if (!hostname) {
      return NextResponse.json({ error: "hostname required" }, { status: 400 });
    }

    const logs = await fetchCTLogs(hostname);
    const analysis = analyzeCTLogs(logs);

    return NextResponse.json({ logs, analysis });
  } catch (error) {
    console.error("CT log error:", error);
    return NextResponse.json({ error: "Failed to fetch CT logs" }, { status: 500 });
  }
}