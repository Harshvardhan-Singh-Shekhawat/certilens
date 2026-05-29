"use client";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}{p.name === "Days Left" ? "d" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ chartData, domains }) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500">
        No scan data yet. Add and scan domains to see charts.
      </div>
    );
  }

  const domainRiskData = domains
    .filter((d) => d.scans[0])
    .map((d) => ({
      domain: d.hostname.replace(".com", "").replace(".org", "").replace(".in", ""),
      riskScore: d.scans[0].riskScore,
      daysLeft: Math.max(d.scans[0].daysUntilExpiry, 0),
      expired: d.scans[0].daysUntilExpiry < 0,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Score Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold mb-1">Risk Score Over Time</h2>
        <p className="text-gray-500 text-xs mb-4">Scan history across all domains</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="riskScore"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 3 }}
              name="Risk Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Domain Risk Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold mb-1">Domain Risk Comparison</h2>
        <p className="text-gray-500 text-xs mb-4">Risk score per domain — current scan</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={domainRiskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="domain" tick={{ fill: "#6b7280", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="riskScore" name="Risk Score" radius={[4, 4, 0, 0]}>
              {domainRiskData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.expired ? "#ef4444" :
                    entry.riskScore >= 70 ? "#ef4444" :
                    entry.riskScore >= 40 ? "#f59e0b" :
                    "#22c55e"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Low risk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High/Expired</span>
        </div>
      </motion.div>
    </div>
  );
}