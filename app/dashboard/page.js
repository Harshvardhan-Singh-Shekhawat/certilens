import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";

function getGreeting(name) {
  const hour = new Date().getHours();
  const first = name?.split(" ")[0] || "there";
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

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

  const totalScans = await prisma.scan.count({
    where: { domain: { userId: session.user.id } },
  });

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            {getGreeting(session.user.name)}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here's your certificate intelligence overview — all data from live TLS handshakes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-800 transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Domains</p>
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-sm">🌐</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-400">{domains.length}</p>
            <p className="text-gray-600 text-xs mt-1">monitored</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-red-800 transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">High Risk</p>
              <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                <span className="text-red-400 text-sm">⚠️</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-400">{highRisk}</p>
            <p className="text-gray-600 text-xs mt-1">certificates</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-yellow-800 transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Expiring</p>
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-sm">⏳</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{expiringSoon}</p>
            <p className="text-gray-600 text-xs mt-1">within 30 days</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-green-800 transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Scans</p>
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-sm">🔍</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400">{totalScans}</p>
            <p className="text-gray-600 text-xs mt-1">live handshakes</p>
          </div>
        </div>

        {/* Charts */}
        <DashboardCharts chartData={chartData} domains={domains} />

        {/* Domain table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Your Domains</h2>
            
              href="/domains"
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              Manage →
            </a>
          </div>
          {domains.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">No domains added yet</p>
              <p className="text-gray-600 text-sm mb-6">
                Add your first domain to start monitoring its TLS certificate
              </p>
              
                href="/domains"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Add Domain
              </a>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800 text-xs uppercase tracking-wider">
                  <th className="text-left pb-3">Domain</th>
                  <th className="text-left pb-3">Risk Score</th>
                  <th className="text-left pb-3">Expires In</th>
                  <th className="text-left pb-3">Issuer</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => {
                  const scan = domain.scans[0];
                  return (
                    <tr
                      key={domain.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-4 text-white font-medium">
                        {domain.hostname}
                      </td>
                      <td className="py-4">
                        <span className={`font-bold text-lg ${
                          !scan ? "text-gray-500" :
                          scan.riskScore >= 70 ? "text-red-400" :
                          scan.riskScore >= 40 ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {scan ? scan.riskScore : "—"}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`font-medium ${
                          !scan ? "text-gray-500" :
                          scan.daysUntilExpiry <= 14 ? "text-red-400" :
                          scan.daysUntilExpiry <= 30 ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {scan?.daysUntilExpiry != null ? `${scan.daysUntilExpiry}d` : "—"}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400 text-xs">
                        {scan?.issuer?.split(",")[0] || "—"}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          !scan ? "bg-gray-800 text-gray-400" :
                          scan.riskLabel === "critical" ? "bg-red-900/50 text-red-400" :
                          scan.riskLabel === "high" ? "bg-orange-900/50 text-orange-400" :
                          scan.riskLabel === "medium" ? "bg-yellow-900/50 text-yellow-400" :
                          "bg-green-900/50 text-green-400"
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