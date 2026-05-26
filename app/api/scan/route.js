import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import { scanDomain } from "../../../lib/scanner";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domainId, hostname } = await req.json();

    if (!domainId || !hostname) {
      return NextResponse.json({ error: "Missing domainId or hostname" }, { status: 400 });
    }

    // Run real TLS scan
    const result = await scanDomain(hostname);

    // Save scan to database
    const scan = await prisma.scan.create({
      data: {
        domainId,
        valid: result.valid,
        expiresAt: result.expiresAt,
        issuedAt: result.issuedAt,
        issuer: result.issuer,
        subject: result.subject,
        sans: result.sans,
        keyBits: result.keyBits,
        signatureAlg: result.signatureAlg,
        chainDepth: result.chainDepth,
        daysUntilExpiry: result.daysUntilExpiry,
        riskScore: result.riskScore,
        riskLabel: result.riskLabel,
        rawData: result.rawData,
      },
    });

    // Create alert if high risk
    if (result.riskScore >= 40 || result.daysUntilExpiry <= 30) {
      await prisma.alert.create({
        data: {
          domainId,
          type: result.daysUntilExpiry <= 30 ? "expiry" : "risk",
          message:
            result.daysUntilExpiry <= 30
              ? `Certificate expires in ${result.daysUntilExpiry} days`
              : `High risk score detected: ${result.riskScore}/100`,
          severity:
            result.riskScore >= 70 ? "critical" :
            result.riskScore >= 40 ? "high" : "medium",
        },
      });
    }

    return NextResponse.json({ success: true, scan });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: error.message || "Scan failed" },
      { status: 500 }
    );
  }
}