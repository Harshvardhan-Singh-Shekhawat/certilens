"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Anomalies() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/anomalies")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Anomaly Detection</h1>
          <p className="text-gray-400 mt-1">
            DBSCAN clustering on your scan history to detect unusual certificate patterns
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-400">Running DBSCAN clustering...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Scans", value: data?.totalScans ?? "—", color: "text-blue-400" },
                { label: "Clusters Found", value: data?.clusters ?? 0, color: "text-purple-400" },
                { label: "Anomalies", value: data?.noisePoints ?? 0, color: data?.noisePoints > 0 ? "text-red-400" : "text-green-400" },
                { label: "Status", value: data?.noisePoints === 0 ? "Clean" : "Alert", color: data?.noisePoints > 0 ? "text-red-400" : "text-green-400" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center"
                >
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`border rounded-xl p-5 mb-8 ${
                data?.noisePoints > 0
                  ? "bg-red-900/20 border-red-800"
                  : "bg-green-900/20 border-green-800"
              }`}
            >
              <p className={`font-medium ${data?.noisePoints > 0 ? "text-red-400" : "text-green-400"}`}>
                {data?.message}
              </p>
            </motion.div>

            {/* Anomaly list */}
            {data?.anomalies?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-red-400">
                  Anomalous Scans
                </h2>
                <div className="space-y-3">
                  {data.anomalies.map((anomaly, i) => (
                    <motion.div
                      key={anomaly.scanId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-gray-900 border border-red-800 rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">{anomaly.hostname}</h3>
                        <span className="text-gray-500 text-xs">
                          {new Date(anomaly.scannedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                          <p className="font-bold text-red-400">{anomaly.riskScore}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Expires In</p>
                          <p className="font-bold text-yellow-400">{anomaly.daysUntilExpiry}d</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Key Bits</p>
                          <p className="font-bold text-blue-400">{anomaly.keyBits}</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{anomaly.reason}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 bg-gray-900 border border-gray-800 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold mb-3">How DBSCAN Works Here</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                DBSCAN (Density-Based Spatial Clustering of Applications with Noise) groups your
                scans into clusters based on three dimensions: risk score, days until expiry,
                and key bit strength.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Scans that don't fit into any cluster — called noise points — are flagged as
                anomalies. This catches certificates that deviate significantly from your normal
                pattern, such as a sudden weak-key certificate or an unexpected expiry spike.
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}