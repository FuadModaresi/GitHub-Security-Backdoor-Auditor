'use client';

import React, { useSyncExternalStore } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { SecurityReport, HealthHistoryPoint } from '@/types/security';
import {
  ShieldAlert,
  BarChart3,
  Layers,
  Loader2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

interface ChartsSectionProps {
  report: SecurityReport;
  isDark: boolean;
  history?: HealthHistoryPoint[];
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#f43f5e', // rose-500
  High: '#f97316',     // orange-500
  Medium: '#eab308',   // yellow-500
  Low: '#3b82f6',      // blue-500
  Info: '#6b7280',     // gray-500
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  report,
  isDark,
  history = [],
}) => {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const chartPayload = report.metrics_summary.chart_payloads;
  const severityDist = chartPayload.severity_distribution_chart;

  // Prepare Pie Chart data
  const pieData = severityDist.labels
    .map((label, index) => ({
      name: label,
      value: severityDist.data[index] || 0,
      color: SEVERITY_COLORS[label] || '#94a3b8',
    }))
    .filter((item) => item.value > 0);

  const totalVulnerabilities = pieData.reduce((acc, curr) => acc + curr.value, 0);

  // Prepare Directory Risk data
  const directoryData = (chartPayload.risk_by_directory || []).map((item) => ({
    name: item.path.length > 24 ? `...${item.path.slice(-21)}` : item.path,
    fullPath: item.path,
    risk: item.risk_score,
  }));

  // Prepare Categories data
  const categories = report.metrics_summary.vulnerability_categories;
  const categoryData = [
    { name: 'Backdoors & Obfuscation', count: categories.backdoors_and_obfuscation || 0 },
    { name: 'Injection Flaws', count: categories.injection_flaws || 0 },
    { name: 'Auth & Crypto', count: categories.authentication_and_crypto || 0 },
    { name: 'Supply Chain Risks', count: categories.supply_chain_risks || 0 },
    { name: 'Access Control', count: categories.access_control || 0 },
  ].filter((c) => c.count > 0);

  // Fallback history if none provided
  const activeScore = report.repository_metadata.overall_security_score;
  const activeRepo = report.repository_metadata.repository_url.split('/').pop() || 'current-repo';
  const historyData: HealthHistoryPoint[] =
    history.length > 0
      ? history
      : [
          {
            id: '1',
            timestamp: '08:00',
            label: 'Baseline Ingest',
            repo: activeRepo,
            score: activeScore,
            risk: report.repository_metadata.risk_level,
          },
        ];

  // Calculate delta from previous point
  const lastPoint = historyData[historyData.length - 1];
  const prevPoint = historyData.length > 1 ? historyData[historyData.length - 2] : null;
  const scoreDelta = prevPoint ? lastPoint.score - prevPoint.score : 0;

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#1e293b' : '#cbd5e1';

  return (
    <div className="space-y-5">
      {/* 1. Security Health History Line / Area Chart */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Security Health History</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20">
                  Trend Telemetry
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Overall security score trajectory over time across repository scans and triage actions
              </p>
            </div>
          </div>

          {/* Right score delta badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Current Score</div>
              <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
                {activeScore.toFixed(1)}
                <span className="text-xs text-neutral-400 font-normal"> / 100</span>
              </div>
            </div>

            {prevPoint && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                  scoreDelta > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : scoreDelta < 0
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700'
                }`}
                title="Score change from previous scan/action"
              >
                {scoreDelta > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                ) : scoreDelta < 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                ) : null}
                <span>
                  {scoreDelta > 0 ? `+${scoreDelta.toFixed(1)}` : scoreDelta.toFixed(1)} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Line / Area Chart Container */}
        <div className="h-60 w-full flex items-center justify-center">
          {!isMounted ? (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
              <span>Plotting score history...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.4} vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fill: textColor, fontSize: 11, fontFamily: 'monospace' }}
                  stroke={gridColor}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: textColor, fontSize: 11, fontFamily: 'monospace' }}
                  stroke={gridColor}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HealthHistoryPoint;
                      const isHigh = data.score >= 80;
                      const isMed = data.score >= 60;
                      const badgeColor = isHigh
                        ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                        : isMed
                        ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
                        : 'text-rose-500 bg-rose-500/10 border-rose-500/30';

                      return (
                        <div
                          style={{
                            backgroundColor: tooltipBg,
                            borderColor: tooltipBorder,
                          }}
                          className="px-3.5 py-2.5 rounded-lg border shadow-xl text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {data.label}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColor}`}
                            >
                              {data.risk}
                            </span>
                          </div>

                          <div className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                            Repo: <span className="text-neutral-700 dark:text-neutral-300">{data.repo}</span>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                            <span className="text-neutral-500 text-[11px]">Security Score:</span>
                            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                              {data.score.toFixed(1)} / 100
                            </span>
                          </div>

                          <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Logged at {data.timestamp}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: '80 Resilient', fill: '#10b981', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={50}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: '50 Critical', fill: '#f43f5e', fontSize: 10, position: 'right' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreAreaGradient)"
                  activeDot={{
                    r: 5,
                    fill: '#06b6d4',
                    stroke: isDark ? '#0f172a' : '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Horizontal Timeline Tracker */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs overflow-x-auto gap-2">
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Audit Checkpoints ({historyData.length}):</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {historyData.map((pt, i) => (
              <div
                key={pt.id || i}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono flex-shrink-0"
              >
                <span className="text-neutral-500">{pt.timestamp}</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[120px]">
                  {pt.label}
                </span>
                <span
                  className={`font-bold ${
                    pt.score >= 80
                      ? 'text-emerald-500'
                      : pt.score >= 60
                      ? 'text-yellow-500'
                      : 'text-rose-500'
                  }`}
                >
                  {pt.score.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Grid Cards: Severity Donut, Directory Risk, Threat Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Severity Distribution Donut Chart */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Severity Distribution
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Threat triage breakdown by impact tier
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              {totalVulnerabilities} Total
            </span>
          </div>

          <div className="relative h-60 w-full flex items-center justify-center">
            {!isMounted ? (
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                <span>Loading telemetry...</span>
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div
                            style={{
                              backgroundColor: tooltipBg,
                              borderColor: tooltipBorder,
                            }}
                            className="px-3 py-2 rounded-lg border shadow-lg text-xs"
                          >
                            <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.payload.color }}
                              />
                              <span>{data.name}</span>
                            </div>
                            <div className="mt-1 text-neutral-600 dark:text-neutral-400 font-mono">
                              {data.value} findings ({((Number(data.value) / totalVulnerabilities) * 100).toFixed(0)}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-neutral-400">No findings detected</div>
            )}

            {/* Donut Center Summary */}
            {isMounted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                  {report.vulnerabilities.length}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Findings
                </span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-600 dark:text-neutral-300">{item.name}</span>
                </div>
                <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Toxic Directories Heatmap / Risk Score */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Risk by Directory
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Toxic directory concentrations (0-100 score)
                </p>
              </div>
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {!isMounted ? (
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                <span>Mapping directory risk...</span>
              </div>
            ) : directoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={directoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} opacity={0.5} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: textColor, fontSize: 10 }}
                    stroke={gridColor}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: textColor, fontSize: 11, fontFamily: 'monospace' }}
                    width={110}
                    stroke={gridColor}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            style={{
                              backgroundColor: tooltipBg,
                              borderColor: tooltipBorder,
                            }}
                            className="px-3 py-2 rounded-lg border shadow-lg text-xs"
                          >
                            <div className="font-mono text-neutral-900 dark:text-neutral-100 font-semibold mb-1">
                              {data.fullPath}
                            </div>
                            <div className="text-neutral-600 dark:text-neutral-400">
                              Risk Score: <span className="font-bold text-rose-500">{data.risk}/100</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                    {directoryData.map((entry, index) => {
                      const fill =
                        entry.risk >= 90
                          ? '#ef4444'
                          : entry.risk >= 70
                          ? '#f97316'
                          : entry.risk >= 40
                          ? '#eab308'
                          : '#3b82f6';
                      return <Cell key={`bar-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                No directory risk data available
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;90 Toxic
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> 70-89 High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> 40-69 Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> &lt;40 Low
            </span>
          </div>
        </div>

        {/* Vulnerability Threat Vectors */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Threat Categories
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Vector classification distribution
                </p>
              </div>
            </div>
          </div>

          <div className="h-60 w-full flex flex-col justify-center space-y-3">
            {categoryData.map((cat) => {
              const percentage = totalVulnerabilities > 0 ? (cat.count / totalVulnerabilities) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {cat.name}
                    </span>
                    <span className="font-mono text-neutral-500 dark:text-neutral-400">
                      {cat.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 flex items-center justify-between">
            <span>OWASP Top 10 &amp; MITRE ATT&amp;CK Mapping</span>
            <span className="font-mono text-cyan-500 font-medium">5 Vectors Audited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

