'use client';

import React from 'react';
import { SecurityReport } from '@/types/security';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileCode2, CheckCircle2, Copy, Check } from 'lucide-react';

interface ScoreboardProps {
  report: SecurityReport;
  remediatedCount: number;
  totalCount: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ report, remediatedCount, totalCount }) => {
  const [copiedSummary, setCopiedSummary] = React.useState(false);
  const metadata = report.repository_metadata;
  const score = metadata.overall_security_score;
  const risk = metadata.risk_level;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(report.executive_summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Determine score color
  const getScoreTheme = (val: number) => {
    if (val >= 80) {
      return {
        text: 'text-emerald-500 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        ring: '#10b981',
        label: 'Resilient Posture',
      };
    }
    if (val >= 60) {
      return {
        text: 'text-yellow-500 dark:text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/20',
        ring: '#eab308',
        label: 'Elevated Risk',
      };
    }
    return {
      text: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      ring: '#f43f5e',
      label: 'Critical Vulnerability Level',
    };
  };

  const getRiskBadge = (r: string) => {
    switch (r) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
    }
  };

  const scoreTheme = getScoreTheme(score);
  const strokeDashoffset = 283 - (283 * Math.min(Math.max(score, 0), 100)) / 100;

  return (
    <div className="space-y-4">
      {/* Top Banner: Score Gauge, Metrics, and Target */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Overall Security Score Gauge */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-neutral-200 dark:stroke-neutral-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={scoreTheme.ring}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold font-mono ${scoreTheme.text}`}>
                {score.toFixed(0)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-400">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Security Score
            </div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {scoreTheme.label}
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold tracking-wide ${getRiskBadge(
                  risk
                )}`}
              >
                {risk} RISK
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Files Scanned */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase tracking-wider font-medium">Files Ingested</span>
            <FileCode2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
              {metadata.total_files_scanned}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              AST &amp; Regex Manifests Parsed
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono pt-2 border-t border-neutral-100 dark:border-neutral-800 truncate">
            {metadata.repository_url.replace('https://github.com/', '')}
          </div>
        </div>

        {/* Card 3: Vulnerabilities Detected */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase tracking-wider font-medium">Threat Findings</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-500">
                {report.metrics_summary.severity_counts.critical +
                  report.metrics_summary.severity_counts.high}
              </span>
              <span className="text-xs text-neutral-500 font-medium">Critical / High</span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {totalCount} Total Issues Cataloged
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 font-mono">
            <span className="text-rose-500 font-semibold">{report.metrics_summary.severity_counts.critical} Crit</span>
            <span>·</span>
            <span className="text-orange-500 font-semibold">{report.metrics_summary.severity_counts.high} High</span>
            <span>·</span>
            <span className="text-yellow-500 font-semibold">{report.metrics_summary.severity_counts.medium} Med</span>
          </div>
        </div>

        {/* Card 4: Remediation Progress */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase tracking-wider font-medium">Remediation Triage</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-500">
                {remediatedCount} / {totalCount}
              </span>
              <span className="text-xs text-neutral-500">
                ({totalCount > 0 ? ((remediatedCount / totalCount) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${totalCount > 0 ? (remediatedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span>Diff Patches Ready</span>
            <span className="text-emerald-500 font-mono font-medium">
              {totalCount - remediatedCount} Remaining
            </span>
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Executive Leadership Assessment
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                High-level threat vector synthesis and emergency action items
              </p>
            </div>
          </div>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors font-medium flex-shrink-0"
            title="Copy executive summary"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 border-l-2 border-neutral-300 dark:border-neutral-700 pl-3 italic">
          &ldquo;{report.executive_summary}&rdquo;
        </p>
      </div>
    </div>
  );
};
