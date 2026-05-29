"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChainGraph from "@/components/ChainGraph";

export default function Domains() {
  const [domains, setDomains] = useState([]);
  const [hostname, setHostname] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState({});
  const [deleting, setDeleting] = useState({});
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    const res = await fetch("/api/domains");
    const data = await res.json();
    setDomains(data.domains || []);
    setFetching(false);
  };

  const addDomain = async () => {
    if (!hostname.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setHostname("");
    setLoading(false);
    await fetchDomains();
    await scanDomain(data.domain.id, data.domain.hostname);
  };

  const scanDomain = async (domainId, hostname) => {
    setScanning((prev) => ({ ...prev, [domainId]: true }));

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId, hostname }),
    });

    const data = await res.json();
    setScanning((prev) => ({ ...prev, [domainId]: false }));

    if (res.ok) {
      await fetchDomains();
    } else {
      setError(data.error || "Scan failed");
    }
  };

  const deleteDomain = async (domainId) => {
    if (!confirm("Delete this domain and all its scan history?")) return;
    setDeleting((prev) => ({ ...prev, [domainId]: true }));

    const res = await fetch(`/api/domains/${domainId}`, { method: "DELETE" });

    if (res.ok) {
      await fetchDomains();
    } else {
      setError("Failed to delete domain");
    }

    setDeleting((prev) => ({ ...prev, [domainId]: false }));
  };

  const toggleExpanded = (domainId) => {
    setExpanded((prev) => ({ ...prev, [domainId]: !prev[domainId] }));
  };

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Domains</h1>
          <p className="text-gray-400 mt-1">
            Add domains to monitor their TLS certificates in real time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">Add New Domain</h2>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. github.com or cloudflare.com"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDomain()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={addDomain}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {loading ? "Adding..." : "Add + Scan"}
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-2">
            No need for https:// — just the domain name
          </p>
        </motion.div>

        <AnimatePresence>
          <div className="space-y-4">
            {fetching ? (
              <div className="text-center py-10 text-gray-500">Loading domains...</div>
            ) : domains.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No domains yet. Add your first domain above.
              </div>
            ) : (
              domains.map((domain, index) => {
                const scan = domain.scans[0];
                const isScanning = scanning[domain.id];
                const isDeleting = deleting[domain.id];
                const isExpanded = expanded[domain.id];
                return (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        
                        <a
                          href={`/domains/${domain.id}`}
                          className="text-lg font-semibold text-white hover:text-blue-400 transition">
                          {domain.hostname}
                        </a>
                        <p className="text-gray-500 text-sm">
                          Added {new Date(domain.addedAt).toLocaleDateString()}
                          {" · "}
                          {domain._count.scans} scan{domain._count.scans !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {scan && (
                          <button
                            onClick={() => toggleExpanded(domain.id)}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition"
                          >
                            {isExpanded ? "Hide Chain" : "View Chain"}
                          </button>
                        )}
                        <button
                          onClick={() => scanDomain(domain.id, domain.hostname)}
                          disabled={isScanning}
                          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                        >
                          {isScanning ? (
                            <span className="flex items-center gap-2">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                              />
                              Scanning...
                            </span>
                          ) : "Re-scan"}
                        </button>
                        <button
                          onClick={() => deleteDomain(domain.id)}
                          disabled={isDeleting}
                          className="bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 text-red-400 text-sm font-semibold px-4 py-2 rounded-lg transition"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {isScanning ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 text-blue-400 text-sm py-4"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                        Running live TLS handshake...
                      </motion.div>
                    ) : scan ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Risk Score</p>
                            <p className={`text-xl font-bold ${
                              scan.riskScore >= 70 ? "text-red-400" :
                              scan.riskScore >= 40 ? "text-yellow-400" :
                              "text-green-400"
                            }`}>
                              {scan.riskScore}/100
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Expires In</p>
                            <p className={`text-xl font-bold ${
                              scan.daysUntilExpiry <= 14 ? "text-red-400" :
                              scan.daysUntilExpiry <= 30 ? "text-yellow-400" :
                              "text-green-400"
                            }`}>
                              {scan.daysUntilExpiry}d
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Key Bits</p>
                            <p className="text-xl font-bold text-blue-400">
                              {scan.keyBits || "—"}
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Chain Depth</p>
                            <p className="text-xl font-bold text-blue-400">
                              {scan.chainDepth}
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3 col-span-2">
                            <p className="text-gray-500 text-xs mb-1">Issuer</p>
                            <p className="text-sm text-gray-300 truncate">{scan.issuer}</p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-3 col-span-2">
                            <p className="text-gray-500 text-xs mb-1">Signature Algorithm</p>
                            <p className="text-sm text-gray-300">{scan.signatureAlg}</p>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 overflow-hidden"
                            >
                              <ChainGraph scan={{ ...scan, domain }} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm">No scan data yet</div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
