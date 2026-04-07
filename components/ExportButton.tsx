"use client";

import { Download } from "lucide-react";
import { parseChartFromResponse, cleanResponseContent, ChartData } from "@/lib/tools";

interface ExportButtonProps {
  content: string;
  filename: string;
  label?: string;
}

function chartToHTML(chart: ChartData): string {
  const title = chart.title ? `<h3 style="margin: 24px 0 12px; color: #334155;">${chart.title}</h3>` : "";

  if (chart.type === "comparison" && chart.comparison) {
    const headers = chart.comparison.columns
      .map((col) => `<th style="padding:12px 16px;text-align:center;font-weight:700;color:${col.highlight ? "#6366f1" : "#0f172a"};border-bottom:2px solid ${col.highlight ? "#6366f1" : "#e2e8f0"};background:${col.highlight ? "#6366f108" : "#f8fafc"}">${col.name}</th>`)
      .join("");
    const rows = chart.comparison.features
      .map((feat, fi) => {
        const cells = chart.comparison!.columns
          .map((col) => {
            const val = col.values[fi] || "—";
            const isPos = val.includes("✓") || val.includes("✔");
            const isNeg = val.includes("✗") || val === "X" || val === "None";
            return `<td style="padding:10px 16px;text-align:center;color:${isPos ? "#10b981" : isNeg ? "#ef4444" : "#475569"};font-weight:${isPos || isNeg ? 600 : 400};border-bottom:1px solid #f1f5f9;background:${col.highlight ? "#6366f104" : "transparent"}">${val}</td>`;
          })
          .join("");
        return `<tr><td style="padding:10px 16px;color:#334155;font-weight:500;border-bottom:1px solid #f1f5f9">${feat}</td>${cells}</tr>`;
      })
      .join("");
    return `${title}<table style="width:100%;border-collapse:separate;border-spacing:0;font-size:0.9rem;margin:16px 0"><thead><tr><th style="padding:12px 16px;text-align:left;color:#64748b;font-weight:500;border-bottom:2px solid #e2e8f0;background:#f8fafc">Feature</th>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  if (chart.type === "metric") {
    const cards = chart.labels
      .map((label, i) => {
        const val = chart.datasets[0]?.data[i] || 0;
        return `<div style="text-align:center;padding:24px 16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><div style="font-size:1.8rem;font-weight:800;color:#6366f1">${formatExportValue(val, chart.unit)}</div><div style="font-size:0.85rem;color:#64748b;margin-top:8px">${label}</div></div>`;
      })
      .join("");
    return `${title}<div style="display:grid;grid-template-columns:repeat(${Math.min(chart.labels.length, 4)},1fr);gap:16px;margin:16px 0">${cards}</div>`;
  }

  // Bar/line/pie/funnel — render as HTML table fallback
  if (chart.datasets[0]) {
    const rows = chart.labels
      .map((label, i) => {
        const cells = chart.datasets
          .map((ds) => `<td style="padding:10px 16px;text-align:right;border-bottom:1px solid #f1f5f9">${formatExportValue(ds.data[i], chart.unit)}</td>`)
          .join("");
        return `<tr><td style="padding:10px 16px;font-weight:500;color:#334155;border-bottom:1px solid #f1f5f9">${label}</td>${cells}</tr>`;
      })
      .join("");
    const headers = chart.datasets
      .map((ds) => `<th style="padding:12px 16px;text-align:right;color:#6366f1;font-weight:600;border-bottom:2px solid #e2e8f0">${ds.label}</th>`)
      .join("");
    return `${title}<table style="width:100%;border-collapse:separate;border-spacing:0;font-size:0.9rem;margin:16px 0"><thead><tr><th style="padding:12px 16px;text-align:left;color:#64748b;font-weight:500;border-bottom:2px solid #e2e8f0"></th>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  return title;
}

function formatExportValue(n: number, unit?: string): string {
  const u = unit || "";
  if (u === "$") {
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  }
  if (u === "%") return `${n}%`;
  if (u === "pts") return `${n} pts`;
  if (u === "x") return `${n}x`;
  if (u) return `${n.toLocaleString()} ${u}`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

export function ExportButton({ content, filename, label }: ExportButtonProps) {
  const handleExport = () => {
    // Parse charts from content
    const charts = parseChartFromResponse(content);
    const cleanText = cleanResponseContent(content);

    // Convert charts to HTML tables
    const chartHTML = charts.map((c) => chartToHTML(c)).join("");

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${filename}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 48px 64px; max-width: 900px; margin: 0 auto; color: #1a1a2e; line-height: 1.7; }
h1 { font-size: 2rem; margin-bottom: 8px; color: #0f172a; }
h2 { font-size: 1.4rem; margin-top: 32px; margin-bottom: 12px; color: #1e293b; border-bottom: 2px solid #6366f1; padding-bottom: 6px; }
h3 { font-size: 1.1rem; margin-top: 24px; margin-bottom: 8px; color: #334155; }
p { margin-bottom: 12px; }
ul, ol { padding-left: 24px; margin-bottom: 16px; }
li { margin-bottom: 6px; }
table { border-collapse: separate; border-spacing: 0; width: 100%; margin: 16px 0; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
th, td { border-bottom: 1px solid #f1f5f9; }
strong { color: #0f172a; }
.header { border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 32px; }
.header small { color: #6366f1; font-weight: 500; }
.footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 0.85rem; color: #94a3b8; }
@media print { body { padding: 24px; } }
</style>
</head>
<body>
<div class="header">
<small>Neuromart.ai — Executive Report</small>
<br><small>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</small>
</div>
${convertMarkdownToHTML(cleanText)}
${chartHTML}
<div class="footer">
Generated by Neuromart.ai ExecSuite
</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--bg-tertiary)",
        color: "var(--text-secondary)",
        fontSize: "0.75rem",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <Download size={12} />
      {label || "Export"}
    </button>
  );
}

function convertMarkdownToHTML(md: string): string {
  return md
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[hulo])/gm, "<p>")
    .replace(/(?<![>])$/gm, "</p>");
}
