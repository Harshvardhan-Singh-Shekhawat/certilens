import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";

export default async function Alerts() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const alerts = await prisma.alert.findMany({
    where: { domain: { userId: session.user.id } },
    include: { domain: true },
    orderBy: { createdAt: "desc" },
  });

  const critical = alerts.filter((a) => a.severity === "critical").length;
  const high = alerts.filter((a) => a.severity === "high").length;
  const medium = alerts.filter((a) => a.severity === "medium").length;

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-gray-400 mt-1">
            Auto-generated from real TLS scan results
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{critical}</p>
            <p className="text-red-500 text-sm mt-1">Critical</p>
          </div>
          <div className="bg-orange-900/20 border border-orange-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{high}</p>
            <p className="text-orange-500 text-sm mt-1">High</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{medium}</p>
            <p className="text-yellow-500 text-sm mt-1">Medium</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No alerts yet. Alerts are generated automatically when scans detect risks.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-gray-900 border rounded-xl p-5 flex items-start justify-between ${
                  alert.severity === "critical" ? "border-red-800" :
                  alert.severity === "high" ? "border-orange-800" :
                  "border-yellow-800"
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      alert.severity === "critical" ? "bg-red-900 text-red-400" :
                      alert.severity === "high" ? "bg-orange-900 text-orange-400" :
                      "bg-yellow-900 text-yellow-400"
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-white font-medium">
                      {alert.domain.hostname}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{alert.message}</p>
                </div>
                <p className="text-gray-600 text-xs whitespace-nowrap ml-4">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}