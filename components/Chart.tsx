"use client";

import { ChartData } from "@/lib/tools";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart,
  ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from "recharts";

function formatValue(n: number, unit?: string): string {
  const u = unit || "";

  if (u === "$") {
    if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  }
  if (u === "%") return `${n}%`;
  if (u === "pts") return `${n} pts`;
  if (u === "x") return `${n}x`;
  if (u === "#") return n.toLocaleString();

  if (u) return `${n.toLocaleString()} ${u}`;

  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function formatTick(n: number, unit?: string): string {
  return formatValue(n, unit);
}

const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 10 };

function RechartBar({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  if (!data.labels?.length || !data.datasets?.length) return null;
  const chartData = data.labels.map((label, i) => {
    const point: Record<string, string | number> = { name: label };
    data.datasets.forEach((ds, di) => {
      point[ds.label || `series${di}`] = ds.data[i] || 0;
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={CHART_MARGIN} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatTick(v, unit)}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          formatter={(value) => formatValue(Number(value), unit)}
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: 10,
            color: "#f1f5f9",
            fontSize: 13,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
          cursor={{ fill: "rgba(99, 102, 241, 0.06)" }}
        />
        {data.datasets.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 13, color: "#64748b", paddingTop: 12 }}
          />
        )}
        {data.datasets.map((ds, di) => (
          <Bar
            key={di}
            dataKey={ds.label || `series${di}`}
            fill={ds.color || colors[di % colors.length]}
            radius={[8, 8, 0, 0]}
            maxBarSize={64}
          >
            <LabelList
              dataKey={ds.label || `series${di}`}
              position="top"
              formatter={(v) => formatValue(Number(v), unit)}
              style={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function RechartLine({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  if (!data.labels?.length || !data.datasets?.length) return null;
  const chartData = data.labels.map((label, i) => {
    const point: Record<string, string | number> = { name: label };
    data.datasets.forEach((ds, di) => {
      point[ds.label || `series${di}`] = ds.data[i] || 0;
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={CHART_MARGIN}>
        <defs>
          {data.datasets.map((ds, di) => {
            const color = ds.color || colors[di % colors.length];
            return (
              <linearGradient key={di} id={`gradient-${di}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatTick(v, unit)}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          formatter={(value) => formatValue(Number(value), unit)}
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: 10,
            color: "#f1f5f9",
            fontSize: 13,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        />
        {data.datasets.length > 1 && (
          <Legend wrapperStyle={{ fontSize: 13, color: "#64748b", paddingTop: 12 }} />
        )}
        {data.datasets.map((ds, di) => {
          const color = ds.color || colors[di % colors.length];
          return (
            <Area
              key={di}
              type="monotone"
              dataKey={ds.label || `series${di}`}
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${di})`}
              dot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: color, stroke: "#fff", strokeWidth: 2 }}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function RechartPie({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  if (!data.labels?.length || !data.datasets?.[0]?.data?.length) return null;
  const values = data.datasets[0]?.data || [];
  const total = values.reduce((a, b) => a + b, 0);
  const chartData = data.labels.map((label, i) => ({
    name: label,
    value: values[i] || 0,
    percentage: total > 0 ? ((values[i] / total) * 100).toFixed(0) : "0",
  }));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 40, width: "100%" }}>
      <ResponsiveContainer width="50%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatValue(Number(value), unit)}
            contentStyle={{
              background: "#1e293b",
              border: "none",
              borderRadius: 10,
              color: "#f1f5f9",
              fontSize: 13,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {chartData.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: colors[i % colors.length], flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>{item.name}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {formatValue(item.value, unit)} ({item.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCards({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(data.labels.length, 4)}, 1fr)`, gap: 20, width: "100%" }}>
      {data.labels.map((label, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
            border: `1px solid ${colors[i % colors.length]}15`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: colors[i % colors.length], opacity: 0.7 }} />
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: colors[i % colors.length], letterSpacing: "-0.03em", lineHeight: 1 }}>
            {formatValue(data.datasets[0]?.data[i] || 0, unit)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 10, fontWeight: 500 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function RechartFunnel({ data, colors, unit }: { data: ChartData; colors: string[]; unit?: string }) {
  if (!data.labels?.length || !data.datasets?.[0]?.data?.length) return null;
  const chartData = data.labels.map((label, i) => ({
    name: label,
    value: data.datasets[0]?.data[i] || 0,
    fill: colors[i % colors.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <FunnelChart>
        <Tooltip
          formatter={(value) => formatValue(Number(value), unit)}
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: 10,
            color: "#f1f5f9",
            fontSize: 13,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        />
        <Funnel
          dataKey="value"
          data={chartData}
          isAnimationActive
        >
          <LabelList
            position="right"
            fill="#334155"
            stroke="none"
            dataKey="name"
            style={{ fontSize: 13, fontWeight: 500 }}
          />
          <LabelList
            position="center"
            formatter={(v) => formatValue(Number(v), unit)}
            style={{ fill: "#fff", fontSize: 13, fontWeight: 700 }}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

function ComparisonTable({ data, colors }: { data: ChartData; colors: string[] }) {
  const comp = data.comparison;
  if (!comp) return null;

  return (
    <div style={{ width: "100%", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "0.88rem" }}>
        <thead>
          <tr>
            <th style={{
              padding: "14px 18px", textAlign: "left", color: "#64748b", fontWeight: 500,
              borderBottom: "2px solid #e2e8f0", background: "#f8fafc",
              borderRadius: "10px 0 0 0",
            }}>
              Feature
            </th>
            {comp.columns.map((col, i) => (
              <th key={i} style={{
                padding: "14px 18px", textAlign: "center", fontWeight: 700,
                color: col.highlight ? colors[0] : "#0f172a",
                borderBottom: `2px solid ${col.highlight ? colors[0] : "#e2e8f0"}`,
                background: col.highlight ? `${colors[0]}08` : "#f8fafc",
                borderRadius: i === comp.columns.length - 1 ? "0 10px 0 0" : undefined,
              }}>
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comp.features.map((feat, fi) => (
            <tr key={fi}>
              <td style={{
                padding: "12px 18px", color: "#334155", fontWeight: 500,
                borderBottom: fi === comp.features.length - 1 ? "none" : "1px solid #f1f5f9",
              }}>
                {feat}
              </td>
              {comp.columns.map((col, ci) => {
                const val = col.values[fi] || "—";
                const isPositive = val.includes("✓") || val.includes("✔") || val.toLowerCase().includes("yes");
                const isNegative = val.includes("✗") || val.includes("✘") || val.toLowerCase() === "x" || val.toLowerCase() === "none";
                return (
                  <td key={ci} style={{
                    padding: "12px 18px", textAlign: "center",
                    color: isPositive ? "#10b981" : isNegative ? "#ef4444" : "#475569",
                    fontWeight: isPositive || isNegative ? 600 : 400,
                    borderBottom: fi === comp.features.length - 1 ? "none" : "1px solid #f1f5f9",
                    background: col.highlight ? `${colors[0]}04` : "transparent",
                    fontSize: isPositive || isNegative ? "0.95rem" : undefined,
                  }}>
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Chart({ data, colors }: { data: ChartData; colors?: string[] }) {
  if (!data || !data.type) return null;
  const c = colors || ["#6366f1", "#818cf8", "#a5b4fc", "#10b981", "#f59e0b", "#ef4444"];
  const unit = data.unit;

  return (
    <div style={{ width: "100%" }}>
      {data.title && (
        <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 16, color: "#334155" }}>
          {data.title}
        </h4>
      )}
      {data.type === "bar" && <RechartBar data={data} colors={c} unit={unit} />}
      {data.type === "line" && <RechartLine data={data} colors={c} unit={unit} />}
      {data.type === "pie" && <RechartPie data={data} colors={c} unit={unit} />}
      {data.type === "metric" && <MetricCards data={data} colors={c} unit={unit} />}
      {data.type === "funnel" && <RechartFunnel data={data} colors={c} unit={unit} />}
      {data.type === "comparison" && <ComparisonTable data={data} colors={c} />}
    </div>
  );
}
