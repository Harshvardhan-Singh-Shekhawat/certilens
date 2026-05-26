import tls from "tls";
import https from "https";

export async function scanDomain(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const socket = tls.connect(options, () => {
      try {
        const cert = socket.getPeerCertificate(true);

        if (!cert || !cert.subject) {
          socket.destroy();
          reject(new Error("No certificate found"));
          return;
        }

        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

        const issuer = cert.issuer
          ? Object.entries(cert.issuer).map(([k, v]) => `${k}=${v}`).join(", ")
          : "Unknown";

        const subject = cert.subject
          ? Object.entries(cert.subject).map(([k, v]) => `${k}=${v}`).join(", ")
          : "Unknown";

        const sans = cert.subjectaltname
          ? cert.subjectaltname.split(", ").map((s) => s.replace("DNS:", "").trim())
          : [];

        const keyBits = cert.bits || null;
        const signatureAlg = cert.asn1Curve || cert.sigalg || "Unknown";

        let chainDepth = 0;
        let current = cert;
        while (current.issuerCertificate && current.issuerCertificate !== current) {
          chainDepth++;
          current = current.issuerCertificate;
          if (chainDepth > 10) break;
        }

        const riskScore = calculateRiskScore({
          daysUntilExpiry,
          keyBits,
          signatureAlg,
          valid: socket.authorized || true,
          chainDepth,
        });

        socket.destroy();

        resolve({
          valid: true,
          expiresAt: validTo,
          issuedAt: validFrom,
          issuer,
          subject,
          sans,
          keyBits,
          signatureAlg,
          chainDepth,
          daysUntilExpiry,
          riskScore: riskScore.score,
          riskLabel: riskScore.label,
          rawData: {
            fingerprint: cert.fingerprint,
            fingerprint256: cert.fingerprint256,
            serialNumber: cert.serialNumber,
          },
        });
      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });

    socket.on("error", (err) => {
      reject(err);
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      reject(new Error("Connection timed out"));
    });
  });
}

function calculateRiskScore({ daysUntilExpiry, keyBits, signatureAlg, chainDepth }) {
  let score = 0;

  // Expiry risk — highest weight (50 points max)
  if (daysUntilExpiry <= 0) score += 50;
  else if (daysUntilExpiry <= 7) score += 45;
  else if (daysUntilExpiry <= 14) score += 35;
  else if (daysUntilExpiry <= 30) score += 25;
  else if (daysUntilExpiry <= 60) score += 10;
  else if (daysUntilExpiry <= 90) score += 5;

  // Key strength risk (25 points max)
  if (!keyBits) score += 10;
  else if (keyBits < 1024) score += 25;
  else if (keyBits < 2048) score += 20;
  else if (keyBits < 4096) score += 5;

  // Signature algorithm risk (15 points max)
  if (signatureAlg && signatureAlg.toLowerCase().includes("md5")) score += 15;
  else if (signatureAlg && signatureAlg.toLowerCase().includes("sha1")) score += 10;
  else if (signatureAlg === "Unknown") score += 5;

  // Chain depth risk (10 points max)
  if (chainDepth === 0) score += 10;
  else if (chainDepth === 1) score += 5;

  score = Math.min(score, 100);

  let label;
  if (score >= 70) label = "critical";
  else if (score >= 40) label = "high";
  else if (score >= 20) label = "medium";
  else label = "low";

  return { score, label };
}