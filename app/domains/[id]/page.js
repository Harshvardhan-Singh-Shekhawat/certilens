import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export default async function DomainDetail({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const domain = await prisma.domain.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      scans: { orderBy: { scannedAt: "desc" } },
      alerts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!domain) redirect("/domains");

  const latest = domain.scans[0];

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <a href="/domains" className="text-gray-500 hover:text-white text-sm transition">
              ← Domains
            </a>
          </div>
          <h1 className="text-3xl font-bold">{domain.hostname}</h1>
          <p className="text-gray-400 mt-1">
            Added {new Date(domain.addedAt).toLocaleDateString()}
            {" · "}{domain.scans.length} scan{domain.scans.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {latest && (
          <>
            {/* Latest scan overview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Latest Certificate</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-1">Risk Score</p>
                  <p className={`text-2xl font-bold ${
                    latest.riskScore >= 70 ? "text-red-400" :
                    latest.riskScore >= 40 ? "text-yellow-400" :
                    "text-green-400"
                  }`}>{latest.riskScore}/100</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-1">Expires In</p>
                  <p className={`text-2xl font-bold ${
                    latest.daysUntilExpiry <= 14 ? "text-red-400" :
                    latest.daysUntilExpiry <= 30 ? "text-yellow-400" :
                    "text-green-400"
                  }`}>{latest.daysUntilExpiry}d</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-1">Key Bits</p>
                  <p className="text-2xl font-bold text-blue-400">{latest.keyBits || "—"}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-1">Chain Depth</p>
                  <p className="text-2xl font-bold text-blue-400">{latest.chainDepth}</p>
                </div>
              </div>

              {/* Full cert details */}
              <div className="space-y-3">
                {[
                  { label: "Subject", value: latest.subject },
                  { label: "Issuer", value: latest.issuer },
                  { label: "Signature Algorithm", value: latest.signatureAlg },
                  { label: "Valid From", value: latest.issuedAt ? new Date(latest.issuedAt).toUTCString() : "—" },
                  { label: "Valid Until", value: latest.expiresAt ? new Date(latest.expiresAt).toUTCString() : "—" },
                  { label: "Serial Number", value: latest.rawData?.serialNumber || "—" },
                  { label: "Fingerprint (SHA-1)", value: latest.rawData?.fingerprint || "—" },
                  { label: "Fingerprint (SHA-256)", value: latest.rawData?.fingerprint256 || "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                    <p className="text-gray-200 text-sm font-mono break-all">{item.value || "—"}</p>
                  </div>
                ))}

                {/* SANs */}
                {latest.sans && latest.sans.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-2">
                      Subject Alternative Names ({latest.sans.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {latest.sans.map((san, i) => (
                        <span
                          key={i}
                          className="bg-gray-700 text-gray-300 text-xs font-mono px-2 py-1 rounded"
                        >
                          {san}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts */}
            {domain.alerts.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Alerts</h2>
                <div className="space-y-3">
                  {domain.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border rounded-xl p-4 flex items-center justify-between ${
                        alert.severity === "critical" ? "bg-red-900/20 border-red-800" :
                        alert.severity === "high" ? "bg-orange-900/20 border-orange-800" :
                        "bg-yellow-900/20 border-yellow-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          alert.severity === "critical" ? "bg-red-900 text-red-400" :
                          alert.severity === "high" ? "bg-orange-900 text-orange-400" :
                          "bg-yellow-900 text-yellow-400"
                        }`}>
                          {alert.severity}
                        </span>
                        <p className="text-gray-300 text-sm">{alert.message}</p>
                      </div>
                      <p className="text-gray-600 text-xs">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan history */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Scan History</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left pb-3">Scanned At</th>
                    <th className="text-left pb-3">Risk Score</th>
                    <th className="text-left pb-3">Expires In</th>
                    <th className="text-left pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {domain.scans.map((scan) => (
                    <tr key={scan.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                      <td className="py-3 text-gray-400 text-xs">
                        {new Date(scan.scannedAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`font-bold ${
                          scan.riskScore >= 70 ? "text-red-400" :
                          scan.riskScore >= 40 ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {scan.riskScore}/100
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{scan.daysUntilExpiry}d</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          scan.riskLabel === "critical" ? "bg-red-900 text-red-400" :
                          scan.riskLabel === "high" ? "bg-orange-900 text-orange-400" :
                          scan.riskLabel === "medium" ? "bg-yellow-900 text-yellow-400" :
                          "bg-green-900 text-green-400"
                        }`}>
                          {scan.riskLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}