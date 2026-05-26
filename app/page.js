"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6"
        >
          TLS Intelligence Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl font-bold mb-6 leading-tight"
        >
          Certi<span className="text-blue-500">Lens</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-xl mb-4 leading-relaxed"
        >
          Real-time SSL/TLS certificate monitoring with live handshake scanning,
          chain visualization, and intelligent risk scoring.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-gray-600 text-sm mb-10"
        >
          Built on the same certificate intelligence that powers Cloudflare's SSL infrastructure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-4 justify-center mb-20"
        >
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Get Started Free
          </Link>
          <Link
            href="/signin"
            className="border border-gray-700 hover:border-blue-500 text-gray-300 font-semibold px-8 py-3 rounded-lg transition"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-6 text-center"
        >
          {[
            { value: "Live", label: "Real TLS Handshakes", color: "text-blue-500" },
            { value: "ML", label: "Anomaly Detection", color: "text-blue-500" },
            { value: "0₹", label: "Fully Free Stack", color: "text-blue-500" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
              whileHover={{ scale: 1.05, borderColor: "rgba(59,130,246,0.5)" }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-default transition-colors"
            >
              <div className={`text-3xl font-bold ${item.color} mb-2`}>{item.value}</div>
              <div className="text-gray-400 text-sm">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left"
        >
          {[
            {
              icon: "🔐",
              title: "Live TLS Handshakes",
              desc: "Every scan connects directly to your domain via Node.js TLS — no third-party APIs, no cached data.",
            },
            {
              icon: "⚡",
              title: "Weighted Risk Scoring",
              desc: "Multi-factor algorithm scores certs on expiry, key strength, signature algorithm, and chain depth.",
            },
            {
              icon: "🧠",
              title: "CT Log Monitoring",
              desc: "Cross-reference against Cloudflare's Certificate Transparency logs to detect mis-issuance.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 + i * 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}