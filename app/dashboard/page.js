import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const domains = await prisma.domain.findMany({
    where: { userId: session.user.id },
    include: { scans: { orderBy: { scannedAt: "desc" }, take: 1 } },
  });

  const highRisk = await prisma.scan.count({ where: { riskScore: { gte: 70 } } });
  const expiringSoon = await prisma.scan.count({
    where: { daysUntilExpiry: { lte: 30, gte: 0 } },
  });

  const recentScans = await prisma.scan.findMany({
    where: { domain: { userId: session.user.id } },
    include: { domain: true },
    orderBy: { scannedAt: "desc" },
    take: 20,
  });

  const chartData = recentScans.map((scan) => ({
    date: new Date(scan.scannedAt).toLocaleDateString(),
    domain: scan.domain.hostname,
    riskScore: scan.riskScore,
    daysUntilExpiry: scan.daysUntilExpiry,
  })).reverse();

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {session.user.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Domains Monitored</p>
            <p className="text-3xl font-bold text-blue-400">{domains.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">High Risk Certs</p>
            <p className="text-3xl font-bold text-red-400">{highRisk}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Expiring in 30 days</p>
            <p className="text-3xl font-bold text-yellow-400">{expiringSoon}</p>
          </div>
        </div>

        <DashboardCharts chartData={chartData} domains={domains} />

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">Your Domains</h2>
          {domains.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">No domains added yet</p>
              <p className="text-gray-600 text-sm mb-6">
                Add your first domain to start monitoring its TLS certificate
              </p>
              <a href="/domains" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
                Add Domain
              </a>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left pb-3">Domain</th>
                  <th className="text-left pb-3">Risk Score</th>
                  <th className="text-left pb-3">Expires In</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => {
                  const scan = domain.scans[0];
                  return (
                    <tr key={domain.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                      <td className="py-3 text-white font-medium">{domain.hostname}</td>
                      <td className="py-3">
                        <span className={`font-bold ${
                          !scan ? "text-gray-500" :
                          scan.riskScore >= 70 ? "text-red-400" :
                          scan.riskScore >= 40 ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {scan ? scan.riskScore : "-"}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">
                        {scan?.daysUntilExpiry != null ? `${scan.daysUntilExpiry} days` : "-"}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          !scan ? "bg-gray-800 text-gray-400" :
                          scan.riskLabel === "critical" ? "bg-red-900 text-red-400" :
                          scan.riskLabel === "high" ? "bg-orange-900 text-orange-400" :
                          scan.riskLabel === "medium" ? "bg-yellow-900 text-yellow-400" :
                          "bg-green-900 text-green-400"
                        }`}>
                          {scan ? scan.riskLabel : "not scanned"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}