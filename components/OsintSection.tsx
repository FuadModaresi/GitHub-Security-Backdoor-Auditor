'use client';

import React, { useState } from 'react';
import { OsintReport, SeverityLevel } from '@/types/security';
import {
  Users,
  GitCommit,
  Star,
  GitFork,
  Eye,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Info,
  Copy,
  Check,
  UserCheck,
  UserX,
  Radio,
  FileSearch,
} from 'lucide-react';

interface OsintSectionProps {
  osintReport: OsintReport;
  onOpenOsintJson: () => void;
}

export const OsintSection: React.FC<OsintSectionProps> = ({
  osintReport,
  onOpenOsintJson,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedFactorId, setExpandedFactorId] = useState<string | null>(
    osintReport.risk_factors.length > 0 ? osintReport.risk_factors[0].factor_id : null
  );

  const social = osintReport.repository_social_metadata;
  const activity = osintReport.commit_activity_analysis;
  const scores = osintReport.security_correlation_score;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(osintReport.executive_summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'SECURE_ECOSYSTEM':
        return {
          badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          border: 'border-emerald-500/40',
          title: 'Secure & Verified Ecosystem',
          icon: ShieldCheck,
        };
      case 'CAUTION_STALE_PROJECT':
        return {
          badge: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
          border: 'border-yellow-500/40',
          title: 'Caution: Stale / Stagnant Project',
          icon: Clock,
        };
      default:
        return {
          badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          border: 'border-rose-500/40',
          title: 'High Risk Supply Chain Hijack / Takeover',
          icon: ShieldAlert,
        };
    }
  };

  const getSeverityStyle = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
  };

  const verdictConfig = getVerdictStyle(scores.overall_health_verdict);
  const VerdictIcon = verdictConfig.icon;

  // Star-to-Fork Ratio evaluation
  const starToForkRatio =
    social.forks_count > 0 ? (social.stars_count / social.forks_count).toFixed(1) : 'N/A';
  const isRatioAnomalous = social.forks_count > 0 && social.stars_count / social.forks_count > 25.0;

  return (
    <div className="space-y-5">
      {/* 1. Verdict & Dual Gauge Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Health Verdict Card */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Ecosystem Health Verdict
            </span>
            <VerdictIcon className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="my-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border tracking-wide ${verdictConfig.badge}`}
              >
                {scores.overall_health_verdict}
              </span>
            </div>
            <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-2">
              {verdictConfig.title}
            </h4>
          </div>

          <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between font-mono">
            <span>Commit Cadence:</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {activity.commit_frequency_status}
            </span>
          </div>
        </div>

        {/* Social Trust Score Card */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase tracking-wider font-medium">Social Trust Score</span>
            <UserCheck className="w-4 h-4 text-cyan-500" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold font-mono ${
                  scores.social_trust_score >= 80
                    ? 'text-emerald-500'
                    : scores.social_trust_score >= 50
                    ? 'text-yellow-500'
                    : 'text-rose-500'
                }`}
              >
                {scores.social_trust_score.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400 font-normal">/ 100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                style={{ width: `${scores.social_trust_score}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span>Community Density:</span>
            <span className="font-mono text-neutral-700 dark:text-neutral-300">
              {social.contributors_count} Contributors
            </span>
          </div>
        </div>

        {/* Maintainer Hijack / Risk Score Card */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase tracking-wider font-medium">Maintainer Takeover Risk</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold font-mono ${
                  scores.maintainer_risk_score >= 75
                    ? 'text-rose-500'
                    : scores.maintainer_risk_score >= 40
                    ? 'text-yellow-500'
                    : 'text-emerald-500'
                }`}
              >
                {scores.maintainer_risk_score.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400 font-normal">/ 100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  scores.maintainer_risk_score >= 75
                    ? 'bg-rose-500'
                    : scores.maintainer_risk_score >= 40
                    ? 'bg-yellow-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${scores.maintainer_risk_score}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between font-mono">
            <span>Author Archetype:</span>
            <span
              className={`font-semibold ${
                activity.developer_distribution === 'ANONYMOUS_AUTHOR'
                  ? 'text-rose-500'
                  : activity.developer_distribution === 'SINGLE_MAINTAINER'
                  ? 'text-yellow-500'
                  : 'text-emerald-500'
              }`}
            >
              {activity.developer_distribution}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Repository Statistics & Forensics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stars & Forks Ratio */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Stars vs Forks</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
              {social.stars_count.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400 font-mono">/ {social.forks_count} forks</span>
          </div>
          <div className="mt-2 text-[11px] font-mono flex items-center justify-between">
            <span className="text-neutral-500">Ratio: {starToForkRatio}:1</span>
            {isRatioAnomalous && (
              <span className="text-rose-500 font-bold bg-rose-500/10 px-1 rounded">
                Bot Anomaly
              </span>
            )}
          </div>
        </div>

        {/* Total Commits & Cadence */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
            <GitCommit className="w-3.5 h-3.5 text-cyan-500" />
            <span>Commit Volume</span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {activity.total_commits.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] font-mono text-neutral-500 truncate">
            Cadence: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{activity.commit_frequency_status}</span>
          </div>
        </div>

        {/* Project Age & Last Commit */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Project Lifecycle</span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {social.project_age_years.toFixed(1)} <span className="text-xs font-normal text-neutral-400">years</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-neutral-500 truncate">
            Last: {social.last_commit_date.slice(0, 10)}
          </div>
        </div>

        {/* Git Reflog Provenance */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            <span>Git Anomaly Flag</span>
          </div>
          <div className="text-xl font-bold font-mono">
            {activity.suspicious_git_patterns_detected ? (
              <span className="text-rose-500">DETECTED</span>
            ) : (
              <span className="text-emerald-500">CLEAN</span>
            )}
          </div>
          <div className="mt-2 text-[11px] font-mono text-neutral-500">
            {activity.suspicious_git_patterns_detected ? 'Force-push / Unsigned' : 'Linear / Verified'}
          </div>
        </div>
      </div>

      {/* 3. Forensic Investigation Notes Card */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-semibold text-xs">
          <FileSearch className="w-4 h-4 text-cyan-500" />
          <span>Git Reflog &amp; Commit History Forensic Notes</span>
        </div>
        <p className="text-xs font-mono leading-relaxed text-neutral-600 dark:text-neutral-300 p-3 rounded-lg bg-neutral-950 text-neutral-200 border border-neutral-800">
          {activity.forensic_notes}
        </p>
      </div>

      {/* 4. Correlated Risk Factors List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Correlated OSINT Risk Factors ({osintReport.risk_factors.length})
            </h3>
          </div>
          <button
            onClick={onOpenOsintJson}
            className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Inspect OSINT Schema JSON
          </button>
        </div>

        <div className="space-y-2.5">
          {osintReport.risk_factors.map((factor) => {
            const isExpanded = expandedFactorId === factor.factor_id;

            return (
              <div
                key={factor.factor_id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs cursor-pointer"
                onClick={() =>
                  setExpandedFactorId(isExpanded ? null : factor.factor_id)
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border tracking-wide flex-shrink-0 ${getSeverityStyle(
                        factor.severity
                      )}`}
                    >
                      {factor.severity}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-neutral-400">
                          {factor.factor_id}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="text-xs text-neutral-500 font-medium">
                          {factor.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                        {factor.title}
                      </h4>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed pl-1">
                    {factor.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Executive Summary */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Supply Chain &amp; OSINT Intelligence Executive Assessment
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Synthesis of project lifecycle, trust signals, and maintainer risks
              </p>
            </div>
          </div>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors font-medium flex-shrink-0"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 border-l-2 border-neutral-300 dark:border-neutral-700 pl-3 italic">
          &ldquo;{osintReport.executive_summary}&rdquo;
        </p>
      </div>
    </div>
  );
};
