"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CTLogs() {
  const [hostname, setHostname] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const search = async () => {
    if (!hostname.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const clean = hostname.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 28000);

      const res = await fetch(`/api/ctlogs?hostname=${clean}`, {
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch CT logs");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Request failed. Try again or use a smaller domain.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">CT Log Monitor</h1>
          <p className="text-gray-400 mt-1">
            Query Certificate Transparency logs to detect mis-issued certificates
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Powered by crt.sh — the public CT log aggregator. May be slow for popular domains.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
        >
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. jklu.edu.in or yoursite.com"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={search}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {loading ? "Querying..." : "Query CT Logs"}
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-2">
            Tip: Use smaller/less popular domains for faster results
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-400">Querying Certificate Transparency logs...</p>
            <p className="text-gray-600 text-sm mt-1">
              crt.sh can be slow — please wait up to 25 seconds
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {result.analysis.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: "Total Certs", value: result.analysis.summary.total, color: "text-blue-400" },
                    { label: "Unique Issuers", value: result.analysis.summary.uniqueIssuers, color: "text-purple-400" },
                    { label: "Wildcards", value: result.analysis.summary.wildcardCount, color: "text-yellow-400" },
                    { label: "Last 7 Days", value: result.analysis.summary.recentCount, color: "text-orange-400" },
                    { label: "Anomalies", value: result.analysis.anomalies.length, color: result.analysis.anomalies.length > 0 ? "text-red-400" : "text-green-400" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
                    >
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {result.analysis.anomalies.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h2 className="text-lg font-semibold text-red-400">Anomalies Detected</h2>
                  {result.analysis.anomalies.map((anomaly, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`border rounded-xl p-4 ${
                        anomaly.severity === "high"
                          ? "bg-red-900/20 border-red-800"
                          : "bg-yellow-900/20 border-yellow-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          anomaly.severity === "high"
                            ? "bg-red-900 text-red-400"
                            : "bg-yellow-900 text-yellow-400"
                        }`}>
                          {anomaly.severity}
                        </span>
                        <span className="text-gray-300 text-sm">{anomaly.message}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {result.analysis.summary && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
                  <p className="text-gray-500 text-xs mb-1">Dominant Issuer</p>
                  <p className="text-white text-sm font-medium truncate">
                    {result.analysis.summary.dominantIssuer}
                  </p>
                </div>
              )}

              {result.logs.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">
                      Certificate History
                      <span className="text-gray-500 text-sm font-normal ml-2">
                        (last {result.logs.length} records)
                      </span>
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-800">
                          <th className="text-left px-6 py-3">Common Name</th>
                          <th className="text-left px-6 py-3">Issuer</th>
                          <th className="text-left px-6 py-3">Not Before</th>
                          <th className="text-left px-6 py-3">Not After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.logs.map((log, i) => (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-gray-800 hover:bg-gray-800 transition"
                          >
                            <td className="px-6 py-3 text-white font-mono text-xs">{log.commonName}</td>
                            <td className="px-6 py-3 text-gray-400 text-xs max-w-xs truncate">
                              {log.issuerName?.split(",")[0]}
                            </td>
                            <td className="px-6 py-3 text-gray-400 text-xs">
                              {new Date(log.notBefore).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3 text-xs">
                              <span className={new Date(log.notAfter) < new Date() ? "text-red-400" : "text-green-400"}>
                                {new Date(log.notAfter).toLocaleDateString()}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.logs.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No certificate records found for this domain.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}