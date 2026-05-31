"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function ChainGraph({ scan }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!scan || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 700;
    const height = 320;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Background grid
    const defs = svg.append("defs");

    // Glow filter
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Gradient for links
    const linkGradient = defs.append("linearGradient")
      .attr("id", "linkGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    linkGradient.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.8);
    linkGradient.append("stop").attr("offset", "100%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.8);

    const chainDepth = Math.max(scan.chainDepth || 2, 1);
    const riskScore = scan.riskScore || 0;

    // Node colors based on type and risk
    const leafColor = riskScore >= 70 ? "#ef4444" : riskScore >= 40 ? "#f59e0b" : "#22c55e";
    const rootColor = "#6366f1";
    const interColor = "#3b82f6";

    // Build nodes
    const nodes = [];
    const totalNodes = chainDepth + 1;
    const spacing = width / (totalNodes + 1);

    nodes.push({
      id: "root",
      x: spacing,
      y: height / 2,
      label: "Root CA",
      sublabel: "Trust Anchor",
      type: "root",
      color: rootColor,
      radius: 45,
    });

    for (let i = 0; i < chainDepth - 1; i++) {
      nodes.push({
        id: `int-${i}`,
        x: spacing * (i + 2),
        y: height / 2,
        label: `Intermediate`,
        sublabel: scan.issuer?.split(",")[0]?.replace("C=", "") || "CA",
        type: "intermediate",
        color: interColor,
        radius: 38,
      });
    }

    nodes.push({
      id: "leaf",
      x: spacing * totalNodes,
      y: height / 2,
      label: scan.domain?.hostname || "Domain",
      sublabel: `${Math.max(scan.daysUntilExpiry, 0)}d left`,
      type: "leaf",
      color: leafColor,
      radius: 48,
    });

    // Draw animated links
    for (let i = 0; i < nodes.length - 1; i++) {
      const source = nodes[i];
      const target = nodes[i + 1];

      // Shadow line
      svg.append("line")
        .attr("x1", source.x).attr("y1", source.y)
        .attr("x2", source.x).attr("y2", source.y)
        .attr("stroke", "#1e293b")
        .attr("stroke-width", 6)
        .transition().duration(600).delay(i * 200)
        .attr("x2", target.x).attr("y2", target.y);

      // Main line
      svg.append("line")
        .attr("x1", source.x).attr("y1", source.y)
        .attr("x2", source.x).attr("y2", source.y)
        .attr("stroke", "url(#linkGradient)")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "6,3")
        .attr("filter", "url(#glow)")
        .transition().duration(600).delay(i * 200)
        .attr("x2", target.x).attr("y2", target.y);

      // Animated dot traveling along link
      const dot = svg.append("circle")
        .attr("r", 4)
        .attr("fill", target.color)
        .attr("cx", source.x)
        .attr("cy", source.y)
        .attr("opacity", 0)
        .attr("filter", "url(#glow)");

      dot.transition().delay(i * 200 + 300).duration(0).attr("opacity", 1)
        .transition().duration(800).ease(d3.easeLinear)
        .attr("cx", target.x).attr("cy", target.y)
        .transition().duration(200).attr("opacity", 0);
    }

    // Draw nodes
    nodes.forEach((node, i) => {
      const g = svg.append("g")
        .attr("transform", `translate(${node.x}, ${node.y})`)
        .attr("opacity", 0);

      // Outer pulse ring
      g.append("circle")
        .attr("r", node.radius + 12)
        .attr("fill", "none")
        .attr("stroke", node.color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.2);

      // Pulse animation for leaf node
      if (node.type === "leaf") {
        g.append("circle")
          .attr("r", node.radius + 8)
          .attr("fill", "none")
          .attr("stroke", node.color)
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.4)
          .transition().delay(i * 150 + 800)
          .on("start", function repeat() {
            d3.select(this)
              .transition().duration(1500)
              .attr("r", node.radius + 20)
              .attr("opacity", 0)
              .transition().duration(0)
              .attr("r", node.radius + 8)
              .attr("opacity", 0.4)
              .on("start", repeat);
          });
      }

      // Main circle with gradient fill
      const circleGrad = defs.append("radialGradient")
        .attr("id", `grad-${node.id}`);
      circleGrad.append("stop").attr("offset", "0%")
        .attr("stop-color", node.color).attr("stop-opacity", 0.3);
      circleGrad.append("stop").attr("offset", "100%")
        .attr("stop-color", node.color).attr("stop-opacity", 0.05);

      g.append("circle")
        .attr("r", 0)
        .attr("fill", `url(#grad-${node.id})`)
        .attr("stroke", node.color)
        .attr("stroke-width", 2)
        .attr("filter", "url(#glow)")
        .transition().duration(500).delay(i * 150)
        .attr("r", node.radius);

      // Icon based on type
      const icon = node.type === "root" ? "⚓" : node.type === "intermediate" ? "🔗" : "🔐";
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-10")
        .attr("font-size", "18")
        .text(icon);

      // Label
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "8")
        .attr("fill", "white")
        .attr("font-size", "10")
        .attr("font-weight", "700")
        .text(node.label.length > 12 ? node.label.slice(0, 12) + "…" : node.label);

      // Sublabel
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "22")
        .attr("fill", node.color)
        .attr("font-size", "8")
        .text(node.sublabel.length > 14 ? node.sublabel.slice(0, 14) + "…" : node.sublabel);

      // Type badge
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", node.radius + 16)
        .attr("fill", node.color)
        .attr("font-size", "7")
        .attr("font-weight", "700")
        .attr("opacity", 0.7)
        .text(node.type.toUpperCase());

      g.transition().duration(500).delay(i * 150).attr("opacity", 1);
    });

    // Risk score indicator at bottom
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .attr("fill", leafColor)
      .attr("font-size", "11")
      .attr("font-weight", "600")
      .attr("opacity", 0)
      .text(`Risk Score: ${riskScore}/100 · Chain Depth: ${chainDepth} · Key: ${scan.keyBits || "—"} bits`)
      .transition().delay(nodes.length * 150 + 300).duration(400)
      .attr("opacity", 0.8);

  }, [scan]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Certificate Chain Visualization
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"/>Root CA
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>Intermediate
          </span>
          <span className="flex items-center gap-1 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>Leaf
          </span>
        </div>
      </div>
      <svg ref={svgRef} className="w-full" style={{ height: "320px" }} />
    </div>
  );
}