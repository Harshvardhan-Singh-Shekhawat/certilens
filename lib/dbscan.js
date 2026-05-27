// DBSCAN clustering implementation from scratch
// Used to detect anomalous certificate rotation patterns in scan history

function euclideanDistance(a, b) {
  return Math.sqrt(
    Math.pow(a.riskScore - b.riskScore, 2) +
    Math.pow(a.daysUntilExpiry - b.daysUntilExpiry, 2) +
    Math.pow(a.keyBits - b.keyBits, 2)
  );
}

function dbscan(points, epsilon, minPts) {
  const labels = new Array(points.length).fill(-1); // -1 = noise
  let clusterId = 0;

  function rangeQuery(pointIdx) {
    const neighbors = [];
    for (let i = 0; i < points.length; i++) {
      if (euclideanDistance(points[pointIdx], points[i]) <= epsilon) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  function expandCluster(pointIdx, neighbors, clusterId) {
    labels[pointIdx] = clusterId;
    let i = 0;
    while (i < neighbors.length) {
      const neighborIdx = neighbors[i];
      if (labels[neighborIdx] === -1) {
        labels[neighborIdx] = clusterId;
        const newNeighbors = rangeQuery(neighborIdx);
        if (newNeighbors.length >= minPts) {
          neighbors.push(...newNeighbors.filter((n) => !neighbors.includes(n)));
        }
      } else if (labels[neighborIdx] === -2) {
        labels[neighborIdx] = clusterId;
      }
      i++;
    }
  }

  for (let i = 0; i < points.length; i++) {
    if (labels[i] !== -1) continue;
    const neighbors = rangeQuery(i);
    if (neighbors.length < minPts) {
      labels[i] = -2; // noise point
    } else {
      expandCluster(i, neighbors, clusterId);
      clusterId++;
    }
  }

  return labels;
}

export function detectAnomalies(scans) {
  if (scans.length < 3) {
    return {
      anomalies: [],
      clusters: 0,
      noisePoints: 0,
      message: "Not enough scan history for anomaly detection (need 3+)",
    };
  }

  // Normalize data for clustering
  const points = scans.map((scan) => ({
    riskScore: scan.riskScore || 0,
    daysUntilExpiry: Math.min(scan.daysUntilExpiry || 365, 365),
    keyBits: (scan.keyBits || 256) / 100, // normalize
    scanId: scan.id,
    hostname: scan.domain?.hostname || "unknown",
    scannedAt: scan.scannedAt,
  }));

  // Run DBSCAN
  const epsilon = 30;
  const minPts = 2;
  const labels = dbscan(points, epsilon, minPts);

  // Find noise points — these are anomalies
  const anomalies = [];
  labels.forEach((label, i) => {
    if (label === -2) {
      const scan = scans[i];
      anomalies.push({
        scanId: scan.id,
        hostname: scan.domain?.hostname || "unknown",
        scannedAt: scan.scannedAt,
        riskScore: scan.riskScore,
        daysUntilExpiry: scan.daysUntilExpiry,
        keyBits: scan.keyBits,
        reason: buildAnomalyReason(scan, scans),
      });
    }
  });

  const uniqueClusters = new Set(labels.filter((l) => l >= 0));

  return {
    anomalies,
    clusters: uniqueClusters.size,
    noisePoints: anomalies.length,
    totalScans: scans.length,
    message:
      anomalies.length === 0
        ? "All scans within normal patterns"
        : `${anomalies.length} anomalous scan(s) detected outside normal clusters`,
  };
}

function buildAnomalyReason(scan, allScans) {
  const reasons = [];

  const avgRisk =
    allScans.reduce((sum, s) => sum + (s.riskScore || 0), 0) / allScans.length;

  if (scan.riskScore > avgRisk * 1.5) {
    reasons.push(`Risk score ${scan.riskScore} is significantly above average (${Math.round(avgRisk)})`);
  }

  if (scan.daysUntilExpiry < 30) {
    reasons.push(`Certificate expiring in ${scan.daysUntilExpiry} days`);
  }

  if (scan.keyBits && scan.keyBits < 2048) {
    reasons.push(`Weak key size: ${scan.keyBits} bits`);
  }

  return reasons.length > 0 ? reasons.join(". ") : "Statistical outlier in scan cluster";
}