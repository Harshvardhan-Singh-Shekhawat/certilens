import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const domain = await prisma.domain.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Delete related scans and alerts first
    await prisma.scan.deleteMany({ where: { domainId: params.id } });
    await prisma.alert.deleteMany({ where: { domainId: params.id } });
    await prisma.domain.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete domain" }, { status: 500 });
  }
}