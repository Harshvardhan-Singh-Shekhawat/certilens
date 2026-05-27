export async function fetchCTLogs(hostname) {
  try {
    // Try with % wildcard to get more results
    const query = encodeURIComponent(`%.${hostname}`);
    const url = `https://crt.sh/?q=${query}&output=json`;

    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "CertiLens/1.0 TLS Certificate Monitor",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`crt.sh returned ${res.status}`);

    const text = await res.text();
    if (!text || text.trim() === "") return [];

    const data = JSON.parse(text);
    if (!Array.isArray(data)) return [];

    // Deduplicate by serial number
    const seen = new Set();
    const unique = data.filter((cert) => {
      if (seen.has(cert.serial_number)) return false;
      seen.add(cert.serial_number);
      return true;
    });

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

  const issuers = logs.map((l) => l.issuerName);
  const issuerCounts = {};
  issuers.forEach((i) => {
    issuerCounts[i] = (issuerCounts[i] || 0) + 1;
  });

  const dominantIssuer = Object.entries(issuerCounts).sort((a, b) => b[1] - a[1])[0];
  const unexpectedIssuers = Object.entries(issuerCounts).filter(
    ([issuer]) => issuer !== dominantIssuer[0]
  );

  if (unexpectedIssuers.length > 0) {
    anomalies.push({
      type: "unexpected_issuer",
      message: `${unexpectedIssuers.length} certificate(s) issued by unexpected CA(s)`,
      severity: "high",
    });
  }

  const wildcards = logs.filter((l) => l.commonName?.startsWith("*"));
  if (wildcards.length > 0) {
    anomalies.push({
      type: "wildcard_cert",
      message: `${wildcards.length} wildcard certificate(s) detected`,
      severity: "medium",
    });
  }

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