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
      <div className="max-w-6xl mx-auto">
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
          <div className="space-y-6">
            {domains.map((domain) => {
              if (domain.scans.length === 0) return null;

              const latest = domain.scans[domain.scans.length - 1];
              const first = domain.scans[0];
              const riskTrend = latest.riskScore - first.riskScore;

              return (
                <div key={domain.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">{domain.hostname}</h2>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {domain.scans.length} scan{domain.scans.length !== 1 ? "s" : ""}
                        {" · "}First scanned {new Date(first.scannedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Risk Trend</p>
                        <p className={`text-lg font-bold ${
                          riskTrend > 0 ? "text-red-400" :
                          riskTrend < 0 ? "text-green-400" :
                          "text-gray-400"
                        }`}>
                          {riskTrend > 0 ? "↑" : riskTrend < 0 ? "↓" : "→"} {Math.abs(riskTrend)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Risk</p>
                        <p className={`text-lg font-bold ${
                          latest.riskScore >= 70 ? "text-red-400" :
                          latest.riskScore >= 40 ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {latest.riskScore}/100
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Expires In</p>
                        <p className={`text-lg font-bold ${
                          latest.daysUntilExpiry <= 0 ? "text-red-400" :
                          latest.daysUntilExpiry <= 30 ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {latest.daysUntilExpiry}d
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Risk score visualization - horizontal bars */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Risk Score History</p>
                    <div className="space-y-2">
                      {domain.scans.map((scan) => {
                        const width = Math.max((scan.riskScore / 100) * 100, 2);
                        const color =
                          scan.riskScore >= 70 ? "bg-red-500" :
                          scan.riskScore >= 40 ? "bg-yellow-500" :
                          "bg-green-500";
                        return (
                          <div key={scan.id} className="flex items-center gap-3">
                            <span className="text-gray-600 text-xs w-20 shrink-0">
                              {new Date(scan.scannedAt).toLocaleDateString()}
                            </span>
                            <div className="flex-1 bg-gray-800 rounded-full h-2.5 relative">
                              <div
                                className={`${color} h-2.5 rounded-full transition-all`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold w-12 text-right ${
                              scan.riskScore >= 70 ? "text-red-400" :
                              scan.riskScore >= 40 ? "text-yellow-400" :
                              "text-green-400"
                            }`}>
                              {scan.riskScore}/100
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Latest cert details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-800">
                    <div>
                      <p className="text-gray-600 text-xs mb-0.5">Issuer</p>
                      <p className="text-gray-300 text-xs truncate">{latest.issuer?.split(",")[0] || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs mb-0.5">Key Bits</p>
                      <p className="text-blue-400 text-xs font-medium">{latest.keyBits || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs mb-0.5">Algorithm</p>
                      <p className="text-gray-300 text-xs">{latest.signatureAlg || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs mb-0.5">Chain Depth</p>
                      <p className="text-blue-400 text-xs font-medium">{latest.chainDepth}</p>
                    </div>
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