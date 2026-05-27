export async function fetchCTLogs(hostname) {
  try {
    const url = `https://crt.sh/?q=${hostname}&output=json`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error("crt.sh request failed");

    const data = await res.json();

    // Deduplicate by serial number
    const seen = new Set();
    const unique = data.filter((cert) => {
      if (seen.has(cert.serial_number)) return false;
      seen.add(cert.serial_number);
      return true;
    });

    // Parse and return clean cert records
    return unique.slice(0, 20).map((cert) => ({
      id: cert.id,
      issuerName: cert.issuer_name,
      commonName: cert.common_name,
      nameValue: cert.name_value,
      notBefore: cert.not_before,
      notAfter: cert.not_after,
      serialNumber: cert.serial_number,
    }));
  } catch (err) {
    console.error("CT log fetch error:", err.message);
    return [];
  }
}

export function analyzeCTLogs(logs) {
  if (!logs.length) return { anomalies: [], summary: null };

  const anomalies = [];

  // Check for unexpected issuers
  const issuers = logs.map((l) => l.issuerName);
  const issuerCounts = {};
  issuers.forEach((i) => {
    issuerCounts[i] = (issuerCounts[i] || 0) + 1;
  });

  const dominantIssuer = Object.entries(issuerCounts).sort((a, b) => b[1] - a[1])[0];
  const unexpectedIssuers = Object.entries(issuerCounts).filter(
    ([issuer, count]) => issuer !== dominantIssuer[0] && count >= 1
  );

  if (unexpectedIssuers.length > 0) {
    anomalies.push({
      type: "unexpected_issuer",
      message: `${unexpectedIssuers.length} certificate(s) issued by unexpected CA(s)`,
      severity: "high",
    });
  }

  // Check for wildcard certs
  const wildcards = logs.filter((l) => l.commonName?.startsWith("*"));
  if (wildcards.length > 0) {
    anomalies.push({
      type: "wildcard_cert",
      message: `${wildcards.length} wildcard certificate(s) detected`,
      severity: "medium",
    });
  }

  // Check for very recent unexpected issuance
  const last7days = logs.filter((l) => {
    const issued = new Date(l.notBefore);
    const daysDiff = (Date.now() - issued) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  if (last7days.length > 2) {
    anomalies.push({
      type: "rapid_issuance",
      message: `${last7days.length} certificates issued in the last 7 days`,
      severity: "medium",
    });
  }

  return {
    anomalies,
    summary: {
      total: logs.length,
      uniqueIssuers: Object.keys(issuerCounts).length,
      dominantIssuer: dominantIssuer[0],
      wildcardCount: wildcards.length,
      recentCount: last7days.length,
    },
  };
}