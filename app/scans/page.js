import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";

export default async function Scans() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const scans = await prisma.scan.findMany({
    where: { domain: { userId: session.user.id } },
    include: { domain: true },
    orderBy: { scannedAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Scan History</h1>
          <p className="text-gray-400 mt-1">
            Every TLS scan recorded — real data, never seeded
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800 bg-gray-900">
                <th className="text-left px-6 py-4">Domain</th>
                <th className="text-left px-6 py-4">Scanned At</th>
                <th className="text-left px-6 py-4">Risk Score</th>
                <th className="text-left px-6 py-4">Expires In</th>
                <th className="text-left px-6 py-4">Issuer</th>
                <th className="text-left px-6 py-4">Key Bits</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
                    No scans yet. Add a domain to start scanning.
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-4 text-white font-medium">
                      {scan.domain.hostname}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(scan.scannedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${
                        scan.riskScore >= 70 ? "text-red-400" :
                        scan.riskScore >= 40 ? "text-yellow-400" :
                        "text-green-400"
                      }`}>
                        {scan.riskScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        scan.daysUntilExpiry <= 14 ? "text-red-400" :
                        scan.daysUntilExpiry <= 30 ? "text-yellow-400" :
                        "text-green-400"
                      }`}>
                        {scan.daysUntilExpiry}d
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                      {scan.issuer?.split(",")[0] || "—"}
                    </td>
                    <td className="px-6 py-4 text-blue-400">
                      {scan.keyBits || "—"}
                    </td>
                    <td className="px-6 py-4">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}