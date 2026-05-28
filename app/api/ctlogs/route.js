import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const hostname = searchParams.get("hostname");

    if (!hostname) {
      return NextResponse.json({ error: "hostname required" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`https://crt.sh/?q=%.${hostname}&output=json`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; CertiLens/1.0)",
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      return NextResponse.json({ error: `crt.sh returned ${res.status}` }, { status: 502 });
    }

    const text = await res.text();
    if (!text || text.trim() === "") {
      return NextResponse.json({ logs: [], analysis: { anomalies: [], summary: null } });
    }

    const raw = JSON.parse(text);
    if (!Array.isArray(raw)) {
      return NextResponse.json({ logs: [], analysis: { anomalies: [], summary: null } });
    }

    const seen = new Set();
    const unique = raw.filter((cert) => {
      if (seen.has(cert.serial_number)) return false;
      seen.add(cert.serial_number);
      return true;
    });

    const logs = unique.slice(0, 20).map((cert) => ({
      id: cert.id,
      issuerName: cert.issuer_name,
      commonName: cert.common_name,
      notBefore: cert.not_before,
      notAfter: cert.not_after,
      serialNumber: cert.serial_number,
    }));

    const anomalies = [];
    const issuers = logs.map((l) => l.issuerName);
    const issuerCounts = {};
    issuers.forEach((i) => { issuerCounts[i] = (issuerCounts[i] || 0) + 1; });
    const dominant = Object.entries(issuerCounts).sort((a, b) => b[1] - a[1])[0];
    const unexpected = Object.entries(issuerCounts).filter(([k]) => k !== dominant[0]);
    if (unexpected.length > 0) anomalies.push({ severity: "high", message: `${unexpected.length} unexpected CA(s) detected` });
    const wildcards = logs.filter((l) => l.commonName?.startsWith("*"));
    if (wildcards.length > 0) anomalies.push({ severity: "medium", message: `${wildcards.length} wildcard certificate(s) found` });

    return NextResponse.json({
      logs,
      analysis: {
        anomalies,
        summary: {
          total: logs.length,
          uniqueIssuers: Object.keys(issuerCounts).length,
          dominantIssuer: dominant?.[0] || "Unknown",
          wildcardCount: wildcards.length,
          recentCount: logs.filter((l) => (Date.now() - new Date(l.notBefore)) / 86400000 <= 7).length,
        },
      },
    });
  } catch (err) {
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "crt.sh timeout — try a smaller domain" }, { status: 504 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}