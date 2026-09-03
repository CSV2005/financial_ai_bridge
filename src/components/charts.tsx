"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Legend,
} from "recharts";

const inrShort = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}k`;

const inrFull = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px -8px rgba(15,23,42,0.15)",
  fontSize: 12,
  padding: "8px 12px",
};

export interface SeriesPoint {
  label: string;
  income: number;
  expense: number;
  savings: number;
}

export function IncomeExpenseArea({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={inrShort} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => inrFull(Number(v))} contentStyle={tooltipStyle} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12 }} />
        <Area name="Income" type="monotone" dataKey="income" stroke="#059669" strokeWidth={2.4} fill="url(#gi)" />
        <Area name="Expenses" type="monotone" dataKey="expense" stroke="#f59e0b" strokeWidth={2} fill="url(#ge)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function VolatilityBars({ data, avg }: { data: SeriesPoint[]; avg: number }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={inrShort} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => inrFull(Number(v))} contentStyle={tooltipStyle} cursor={{ fill: "#f1f5f9" }} />
        <ReferenceLine
          y={avg}
          stroke="#6366f1"
          strokeDasharray="5 4"
          label={{ value: `avg ${inrFull(avg)}`, position: "insideTopRight", fontSize: 10, fill: "#6366f1" }}
        />
        <Bar name="Monthly income" dataKey="income" radius={[6, 6, 0, 0]} maxBarSize={44}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.income >= avg ? "#10b981" : "#fbbf24"}
              fillOpacity={0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SavingsGrowth({ data }: { data: { label: string; saved: number; cumulative: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={inrShort} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => inrFull(Number(v))} contentStyle={tooltipStyle} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12 }} />
        <Area name="Cumulative savings" type="monotone" dataKey="cumulative" stroke="#0284c7" strokeWidth={2.4} fill="url(#gs)" />
        <Bar name="Monthly deposit" dataKey="saved" fill="#7dd3fc" radius={[5, 5, 0, 0]} maxBarSize={26} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = ["#059669", "#f59e0b", "#0ea5e9", "#8b5cf6", "#f43f5e", "#14b8a6", "#f97316", "#64748b"];

export function ExpenseDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={2.5}
          strokeWidth={2}
          stroke="#fff"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => inrFull(Number(v))} contentStyle={tooltipStyle} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
