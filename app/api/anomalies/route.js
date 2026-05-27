import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import { detectAnomalies } from "../../../lib/dbscan";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const scans = await prisma.scan.findMany({
      where: { domain: { userId: session.user.id } },
      include: { domain: true },
      orderBy: { scannedAt: "desc" },
      take: 100,
    });

    const result = detectAnomalies(scans);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Anomaly detection error:", error);
    return NextResponse.json({ error: "Detection failed" }, { status: 500 });
  }
}