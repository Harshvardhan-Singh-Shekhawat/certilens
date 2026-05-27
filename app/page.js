"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    icon: "🔐",
    title: "Live TLS Handshakes",
    desc: "Every scan connects directly to your domain via Node.js TLS — no third-party APIs, no cached data. Real certificates only.",
  },
  {
    icon: "⚡",
    title: "Weighted Risk Scoring",
    desc: "Multi-factor algorithm scores certs 0–100 across expiry, key strength, signature algorithm, and chain depth.",
  },
  {
    icon: "🧠",
    title: "DBSCAN Anomaly Detection",
    desc: "Clustering algorithm implemented from scratch detects unusual certificate rotation patterns in your scan history.",
  },
  {
    icon: "🌐",
    title: "CT Log Monitoring",
    desc: "Query Certificate Transparency logs to detect mis-issued certificates — the same data Cloudflare uses.",
  },
  {
    icon: "📊",
    title: "Chain Visualization",
    desc: "Animated D3.js graph shows your full certificate chain: Root CA → Intermediate → Leaf, color-coded by risk.",
  },
  {
    icon: "🔔",
    title: "Email Alerts",
    desc: "Auto-generated alerts with beautiful HTML emails when certificates are expiring or risk scores spike.",
  },
];

const stats = [
  { value: "Live", label: "TLS Handshakes" },
  { value: "0₹", label: "Fully Free Stack" },
  { value: "DBSCAN", label: "ML Anomaly Detection" },
  { value: "D3.js", label: "Chain Visualization" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 pt-24 pb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6"
        >
          TLS Certificate Intelligence Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-7xl font-bold mb-6 leading-tight"
        >
          Certi<span className="text-blue-500">Lens</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-xl mb-4 leading-relaxed max-w-2xl"
        >
          Real-time SSL/TLS certificate monitoring with live handshake scanning,
          chain visualization, and intelligent risk scoring.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-gray-600 text-sm mb-10 max-w-lg"
        >
          Built on the same certificate intelligence that powers Cloudflare's SSL infrastructure.
          Zero fake data. Every number from a live TLS handshake.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition text-sm"
          >
            Get Started Free →
          </Link>
          <Link
            href="/signin"
            className="border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white font-semibold px-8 py-3 rounded-lg transition text-sm"
          >
            Sign In
          </Link>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="border-y border-gray-800 bg-gray-900/50 py-8 px-4"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <div className="text-2xl font-bold text-blue-400 mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Everything a TLS platform needs</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Built with the same tools and concepts that power enterprise certificate management —
            at zero cost, fully open source.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
              whileHover={{ scale: 1.02, borderColor: "rgba(59,130,246,0.4)" }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-default transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-white font-semibold mb-2 text-lg">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-gray-800 bg-gray-900/30 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-gray-500">From domain to full certificate intelligence in seconds</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Add a domain", desc: "Type any domain — github.com, cloudflare.com, your own site. No setup required." },
              { step: "02", title: "Live TLS scan", desc: "CertiLens opens a real TLS connection, parses the certificate chain, and runs risk scoring." },
              { step: "03", title: "Get intelligence", desc: "See risk score, expiry, issuer, chain depth, CT log history, and anomaly detection results." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-blue-500/20 mb-4">{item.step}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to monitor your certificates?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Free forever. No credit card. Real TLS intelligence in under 30 seconds.
          </p>
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-lg transition text-sm inline-block"
          >
            Start Monitoring Free →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}