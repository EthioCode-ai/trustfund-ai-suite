"use client";

import { ChartData } from "@/lib/tools";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function BarChart({ data, colors }: { data: ChartData; colors: string[] }) {
  const maxVal = Math.max(...data.datasets.flatMap((d) => d.data));

  return (
    <div style={{ width: "100%", padding: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, marginBottom: 8 }}>
        {data.labels.map((label, i) => (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <span style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: 4 }}>
              {formatNumber(data.datasets[0]?.data[i] || 0)}
            </span>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
              {data.datasets.map((ds, di) => {
                const height = maxVal > 0 ? (ds.data[i] / maxVal) * 100 : 0;
                return (
                  <div
                    key={di}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      background: ds.color || colors[di % colors.length],
                      borderRadius: "6px 6px 0 0",
                      margin: "0 2px",
                      transition: "height 0.8s ease-out",
                      minHeight: 4,
                    }}
                  />
                );
              })}
            </div>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 6, textAlign: "center" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      {data.datasets.length > 1 && (
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
          {data.datasets.map((ds, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: ds.color || colors[i % colors.length] }} />
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{ds.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LineChart({ data, colors }: { data: ChartData; colors: string[] }) {
  const maxVal = Math.max(...data.datasets.flatMap((d) => d.data));
  const height = 200;
  const width = 100;

  return (
    <div style={{ width: "100%", padding: "16px 0" }}>
      <svg viewBox={`0 0 ${width} ${height + 30}`} style={{ width: "100%", height: 230 }}>
        {data.datasets.map((ds, di) => {
          const points = ds.data.map((val, i) => {
            const x = (i / (ds.data.length - 1)) * (width - 10) + 5;
            const y = height - (maxVal > 0 ? (val / maxVal) * (height - 20) : 0) + 10;
            return { x, y };
          });
          const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
          const areaD = pathD + ` L ${points[points.length - 1].x} ${height + 10} L ${points[0].x} ${height + 10} Z`;
          const color = ds.color || colors[di % colors.length];

          return (
            <g key={di}>
              <defs>
                <linearGradient id={`grad-${di}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <path d={areaD} fill={`url(#grad-${di})`} />
              <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
              ))}
            </g>
          );
        })}
        {data.labels.map((label, i) => {
          const x = (i / (data.labels.length - 1)) * (width - 10) + 5;
          return (
            <text key={i} x={x} y={height + 25} textAnchor="middle" fontSize={4} fill="#94a3b8">
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function PieChart({ data, colors }: { data: ChartData; colors: string[] }) {
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
      color: data.datasets[0]?.color || colors[i % colors.length],
      label: data.labels[i],
      percentage: total > 0 ? ((val / total) * 100).toFixed(0) : "0",
    };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "16px 0" }}>
      <svg viewBox="0 0 100 100" style={{ width: 180, height: 180 }}>
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={colors[i % colors.length]} stroke="#fff" strokeWidth={1} />
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length] }} />
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {slice.label} ({slice.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricChart({ data, colors }: { data: ChartData; colors: string[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(data.labels.length, 4)}, 1fr)`, gap: 16, padding: "16px 0" }}>
      {data.labels.map((label, i) => (
        <div
          key={i}
          style={{
            background: `${colors[i % colors.length]}10`,
            border: `1px solid ${colors[i % colors.length]}30`,
            borderRadius: 12,
            padding: "20px 16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: colors[i % colors.length] }}>
            {formatNumber(data.datasets[0]?.data[i] || 0)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function FunnelChart({ data, colors }: { data: ChartData; colors: string[] }) {
  const maxVal = Math.max(...(data.datasets[0]?.data || [1]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 0", alignItems: "center" }}>
      {data.labels.map((label, i) => {
        const val = data.datasets[0]?.data[i] || 0;
        const width = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", width: 80, textAlign: "right" }}>{label}</span>
            <div
              style={{
                height: 32,
                width: `${width}%`,
                background: colors[i % colors.length],
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                paddingLeft: 12,
                transition: "width 0.8s ease-out",
                minWidth: 40,
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                {formatNumber(val)}
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

  return (
    <div style={{ margin: "8px 0" }}>
      {data.title && (
        <h4 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#334155" }}>
          {data.title}
        </h4>
      )}
      {data.type === "bar" && <BarChart data={data} colors={c} />}
      {data.type === "line" && <LineChart data={data} colors={c} />}
      {data.type === "pie" && <PieChart data={data} colors={c} />}
      {data.type === "metric" && <MetricChart data={data} colors={c} />}
      {data.type === "funnel" && <FunnelChart data={data} colors={c} />}
    </div>
  );
}
