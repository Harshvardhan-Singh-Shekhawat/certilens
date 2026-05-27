"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function ChainGraph({ scan }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!scan || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 600;
    const height = 300;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Build chain nodes
    const nodes = [];
    const links = [];

    // Root CA
    nodes.push({
      id: "root",
      label: "Root CA",
      sublabel: "Self-signed",
      type: "root",
      x: width * 0.15,
      y: height / 2,
    });

    // Intermediates
    const chainDepth = scan.chainDepth || 2;
    const intermediateCount = Math.max(chainDepth - 1, 1);

    for (let i = 0; i < intermediateCount; i++) {
      const id = `intermediate-${i}`;
      nodes.push({
        id,
        label: `Intermediate ${i + 1}`,
        sublabel: scan.issuer?.split(",")[0] || "CA",
        type: "intermediate",
        x: width * (0.35 + i * 0.2),
        y: height / 2,
      });
      links.push({
        source: i === 0 ? "root" : `intermediate-${i - 1}`,
        target: id,
      });
    }

    // Leaf cert
    nodes.push({
      id: "leaf",
      label: scan.domain?.hostname || "Domain",
      sublabel: `${scan.daysUntilExpiry}d left`,
      type: "leaf",
      x: width * 0.85,
      y: height / 2,
    });

    links.push({
      source: `intermediate-${intermediateCount - 1}`,
      target: "leaf",
    });

    const nodeMap = {};
    nodes.forEach((n) => (nodeMap[n.id] = n));

    // Draw links
    const linkGroup = svg.append("g");
    links.forEach((link, i) => {
      const source = nodeMap[link.source];
      const target = nodeMap[link.target];

      linkGroup
        .append("line")
        .attr("x1", source.x)
        .attr("y1", source.y)
        .attr("x2", source.x)
        .attr("y2", source.y)
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.6)
        .transition()
        .duration(600)
        .delay(i * 200)
        .attr("x2", target.x)
        .attr("y2", target.y);
    });

    // Draw nodes
    const nodeGroup = svg.append("g");
    nodes.forEach((node, i) => {
      const g = nodeGroup.append("g")
        .attr("transform", `translate(${node.x}, ${node.y})`)
        .attr("opacity", 0);

      // Circle
      const color =
        node.type === "root" ? "#6366f1" :
        node.type === "intermediate" ? "#3b82f6" :
        scan.riskScore >= 70 ? "#ef4444" :
        scan.riskScore >= 40 ? "#f59e0b" :
        "#22c55e";

      g.append("circle")
        .attr("r", 0)
        .attr("fill", color)
        .attr("fill-opacity", 0.15)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .transition()
        .duration(400)
        .delay(i * 150)
        .attr("r", node.type === "leaf" ? 40 : 35);

      // Label
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-8")
        .attr("fill", "white")
        .attr("font-size", "11")
        .attr("font-weight", "600")
        .text(node.label.length > 12 ? node.label.slice(0, 12) + "…" : node.label);

      // Sublabel
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "10")
        .attr("fill", "#9ca3af")
        .attr("font-size", "9")
        .text(node.sublabel.length > 14 ? node.sublabel.slice(0, 14) + "…" : node.sublabel);

      // Type badge
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "24")
        .attr("fill", color)
        .attr("font-size", "8")
        .attr("font-weight", "700")
        .text(node.type.toUpperCase());

      g.transition()
        .duration(400)
        .delay(i * 150)
        .attr("opacity", 1);
    });

    // Arrow markers
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 45)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#3b82f6");

  }, [scan]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">
        Certificate Chain Visualization
      </h3>
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: "300px" }}
      />
    </div>
  );
}