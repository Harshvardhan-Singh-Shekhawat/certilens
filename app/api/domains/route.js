import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const domains = await prisma.domain.findMany({
      where: { userId: session.user.id },
      include: {
        scans: { orderBy: { scannedAt: "desc" }, take: 1 },
        _count: { select: { scans: true, alerts: true } },
      },
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json({ domains });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { hostname } = await req.json();

    if (!hostname) {
      return NextResponse.json({ error: "Hostname is required" }, { status: 400 });
    }

    // Clean hostname
    const clean = hostname
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .trim()
      .toLowerCase();

    const existing = await prisma.domain.findFirst({
      where: { hostname: clean, userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({ error: "Domain already added" }, { status: 400 });
    }

    const domain = await prisma.domain.create({
      data: { hostname: clean, userId: session.user.id },
    });

    return NextResponse.json({ domain }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 });
  }
}