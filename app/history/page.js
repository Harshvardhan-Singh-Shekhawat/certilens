import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";

export default async function History() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const domains = await prisma.domain.findMany({
    where: { userId: session.user.id },
    include: {
      scans: {
        orderBy: { scannedAt: "asc" },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Certificate History</h1>
          <p className="text-gray-400 mt-1">
            Track how your certificates change over time — risk score trends, expiry countdowns, issuer changes
          </p>
        </div>

        {domains.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No domains yet. Add domains to start tracking history.
          </div>
        ) : (
          <div className="space-y-8">
            {domains.map((domain) => {
              if (domain.scans.length === 0) return null;

              const latest = domain.scans[domain.scans.length - 1];
              const first = domain.scans[0];
              const riskTrend = latest.riskScore - first.riskScore;
              const expiryTrend = latest.daysUntilExpiry - first.daysUntilExpiry;

              return (
                <div key={domain.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">{domain.hostname}</h2>
                      <p className="text-gray-500 text-sm mt-1">
                        {domain.scans.length} scan{domain.scans.length !== 1 ? "s" : ""} recorded
                        {" · "}First scanned {new Date(first.scannedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Risk Trend</p>
                        <p className={`text-lg font-bold ${riskTrend > 0 ? "text-red-400" : riskTrend < 0 ? "text-green-400" : "text-gray-400"}`}>
                          {riskTrend > 0 ? "↑" : riskTrend < 0 ? "↓" : "→"} {Math.abs(riskTrend)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Current Risk</p>
                        <p className={`text-lg font-bold ${
                          latest.riskScore >= 70 ? "text-red-400" :
                          latest.riskScore >= 40 ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {latest.riskScore}/100
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Expires In</p>
                        <p className={`text-lg font-bold ${
                          latest.daysUntilExpiry <= 14 ? "text-red-400" :
                          latest.daysUntilExpiry <= 30 ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {latest.daysUntilExpiry}d
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Risk score bar visualization */}
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-3">Risk Score Over Time</p>
                    <div className="flex items-end gap-2 h-20">
                      {domain.scans.map((scan, i) => {
                        const height = Math.max((scan.riskScore / 100) * 80, 4);
                        const color = scan.riskScore >= 70 ? "bg-red-500" :
                          scan.riskScore >= 40 ? "bg-yellow-500" : "bg-green-500";
                        return (
                          <div key={scan.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              className={`w-full ${color} rounded-t opacity-80 group-hover:opacity-100 transition-all`}
                              style={{ height: `${height}px` }}
                            />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              {scan.riskScore}/100 — {new Date(scan.scannedAt).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-600">{new Date(first.scannedAt).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-600">{new Date(latest.scannedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Scan table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-800">
                          <th className="text-left pb-3">Scanned At</th>
                          <th className="text-left pb-3">Risk Score</th>
                          <th className="text-left pb-3">Expires In</th>
                          <th className="text-left pb-3">Key Bits</th>
                          <th className="text-left pb-3">Issuer</th>
                          <th className="text-left pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...domain.scans].reverse().map((scan) => (
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
                            <td className="py-3">
                              <span className={`font-medium ${
                                scan.daysUntilExpiry <= 14 ? "text-red-400" :
                                scan.daysUntilExpiry <= 30 ? "text-yellow-400" :
                                "text-green-400"
                              }`}>
                                {scan.daysUntilExpiry}d
                              </span>
                            </td>
                            <td className="py-3 text-blue-400">{scan.keyBits || "—"}</td>
                            <td className="py-3 text-gray-400 text-xs truncate max-w-xs">
                              {scan.issuer?.split(",")[0] || "—"}
                            </td>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}