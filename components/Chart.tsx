"use client";

import { ChartData } from "@/lib/tools";

function formatValue(n: number, unit?: string): string {
  const u = unit || "";

  if (u === "$") {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  }
  if (u === "%") return `${n}%`;
  if (u === "pts") return `${n} pts`;
  if (u === "x") return `${n}x`;
  if (u === "#") return n.toLocaleString();

  // If unit is a custom string like "users", "donors"
  if (u) return `${n.toLocaleString()} ${u}`;

  // No unit — smart format
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function BarChart({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  const maxVal = Math.max(...data.datasets.flatMap((d) => d.data));

  return (
    <div style={{ width: "100%", padding: "20px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 280, marginBottom: 12 }}>
        {data.labels.map((label, i) => (
          <div key={`${label}-${i}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              {formatValue(data.datasets[0]?.data[i] || 0, unit)}
            </span>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%", gap: 3 }}>
              {data.datasets.map((ds, di) => {
                const height = maxVal > 0 ? (ds.data[i] / maxVal) * 100 : 0;
                return (
                  <div
                    key={di}
                    style={{
                      flex: 1,
                      height: `${Math.max(height, 2)}%`,
                      background: ds.color || colors[di % colors.length],
                      borderRadius: "8px 8px 0 0",
                      transition: "height 0.8s ease-out",
                      minHeight: 6,
                    }}
                  />
                );
              })}
            </div>
            <span style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 8, textAlign: "center", lineHeight: 1.3 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      {data.datasets.length > 1 && (
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
          {data.datasets.map((ds, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 4, background: ds.color || colors[i % colors.length] }} />
              <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 500 }}>{ds.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LineChart({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  const allValues = data.datasets.flatMap((d) => d.data);
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues);
  const range = maxVal - minVal || 1;
  const chartH = 260;
  const chartW = 100;
  const padTop = 15;
  const padBot = 10;

  return (
    <div style={{ width: "100%", padding: "20px 0" }}>
      <svg viewBox={`0 0 ${chartW} ${chartH + 40}`} style={{ width: "100%", height: 320 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padTop + (1 - frac) * (chartH - padTop - padBot);
          const val = minVal + frac * range;
          return (
            <g key={frac}>
              <line x1={8} y1={y} x2={chartW - 2} y2={y} stroke="#e2e8f0" strokeWidth={0.3} />
              <text x={4} y={y + 1.5} fontSize={3} fill="#94a3b8" textAnchor="end">
                {formatValue(Math.round(val), unit)}
              </text>
            </g>
          );
        })}

        {data.datasets.map((ds, di) => {
          const points = ds.data.map((val, i) => {
            const x = data.labels.length > 1
              ? (i / (data.labels.length - 1)) * (chartW - 20) + 10
              : chartW / 2;
            const y = padTop + (1 - (val - minVal) / range) * (chartH - padTop - padBot);
            return { x, y, val };
          });
          const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
          const areaD = pathD + ` L ${points[points.length - 1].x} ${chartH - padBot} L ${points[0].x} ${chartH - padBot} Z`;
          const color = ds.color || colors[di % colors.length];

          return (
            <g key={di}>
              <defs>
                <linearGradient id={`grad-${di}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <path d={areaD} fill={`url(#grad-${di})`} />
              <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={2.5} fill={color} />
                  <text x={p.x} y={p.y - 5} textAnchor="middle" fontSize={3} fill="#334155" fontWeight="600">
                    {formatValue(p.val, unit)}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.labels.map((label, i) => {
          const x = data.labels.length > 1
            ? (i / (data.labels.length - 1)) * (chartW - 20) + 10
            : chartW / 2;
          return (
            <text key={i} x={x} y={chartH + 8} textAnchor="middle" fontSize={3.5} fill="#64748b">
              {label}
            </text>
          );
        })}

        {/* Legend */}
        {data.datasets.length > 1 && data.datasets.map((ds, i) => {
          const color = ds.color || colors[i % colors.length];
          const xOffset = (chartW / 2) - (data.datasets.length * 15) + i * 30;
          return (
            <g key={i}>
              <rect x={xOffset} y={chartH + 18} width={6} height={3} rx={1} fill={color} />
              <text x={xOffset + 8} y={chartH + 21} fontSize={3} fill="#475569">{ds.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PieChart({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  const values = data.datasets[0]?.data || [];
  const total = values.reduce((a, b) => a + b, 0);
  let cumulativeAngle = -90;

  const slices = values.map((val, i) => {
    const angle = total > 0 ? (val / total) * 360 : 0;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      d: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      label: data.labels[i],
      value: val,
      percentage: total > 0 ? ((val / total) * 100).toFixed(0) : "0",
    };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, padding: "20px 0", justifyContent: "center" }}>
      <svg viewBox="0 0 100 100" style={{ width: 220, height: 220 }}>
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={colors[i % colors.length]} stroke="#fff" strokeWidth={0.8} />
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: colors[i % colors.length], flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                {slice.label}
              </span>
              <span style={{ fontSize: "0.8rem", color: "#64748b", marginLeft: 8 }}>
                {slice.percentage}% ({formatValue(slice.value, unit)})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricChart({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(data.labels.length, 4)}, 1fr)`, gap: 20, padding: "20px 0" }}>
      {data.labels.map((label, i) => (
        <div
          key={i}
          style={{
            background: `${colors[i % colors.length]}08`,
            border: `1px solid ${colors[i % colors.length]}25`,
            borderRadius: 16,
            padding: "28px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700, color: colors[i % colors.length], letterSpacing: "-0.02em" }}>
            {formatValue(data.datasets[0]?.data[i] || 0, unit)}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 6, fontWeight: 500 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function FunnelChart({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  const maxVal = Math.max(...(data.datasets[0]?.data || [1]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "20px 0", alignItems: "center" }}>
      {data.labels.map((label, i) => {
        const val = data.datasets[0]?.data[i] || 0;
        const width = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
            <span style={{ fontSize: "0.82rem", color: "#475569", width: 100, textAlign: "right", fontWeight: 500 }}>{label}</span>
            <div
              style={{
                height: 40,
                width: `${width}%`,
                background: colors[i % colors.length],
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                paddingLeft: 16,
                transition: "width 0.8s ease-out",
                minWidth: 50,
              }}
            >
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>
                {formatValue(val, unit)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Chart({ data, colors }: { data: ChartData; colors?: string[] }) {
  const c = colors || ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#10b981", "#f59e0b"];
  const unit = data.unit;

  return (
    <div style={{ margin: "8px 0", width: "100%" }}>
      {data.title && (
        <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 8, color: "#0f172a" }}>
          {data.title}
        </h4>
      )}
      {data.type === "bar" && <BarChart data={data} colors={c} unit={unit} />}
      {data.type === "line" && <LineChart data={data} colors={c} unit={unit} />}
      {data.type === "pie" && <PieChart data={data} colors={c} unit={unit} />}
      {data.type === "metric" && <MetricChart data={data} colors={c} unit={unit} />}
      {data.type === "funnel" && <FunnelChart data={data} colors={c} unit={unit} />}
    </div>
  );
}
