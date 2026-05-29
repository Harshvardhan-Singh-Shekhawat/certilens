import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing domain ID" }, { status: 400 });
    }

    const domain = await prisma.domain.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    await prisma.scan.deleteMany({ where: { domainId: id } });
    await prisma.alert.deleteMany({ where: { domainId: id } });
    await prisma.domain.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}