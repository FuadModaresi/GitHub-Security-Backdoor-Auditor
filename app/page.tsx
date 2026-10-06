'use client';

import React, { useState } from 'react';
import { SAMPLE_REPORTS } from '@/data/sample-reports';
import { SAMPLE_OSINT_REPORTS } from '@/data/sample-osint-reports';
import {
  SecurityReport,
  VulnerabilityFinding,
  HealthHistoryPoint,
  OsintReport,
} from '@/types/security';
import { useTheme } from '@/hooks/use-theme';
import { Navbar } from '@/components/Navbar';
import { Scoreboard } from '@/components/Scoreboard';
import { ChartsSection } from '@/components/ChartsSection';
import { VulnerabilityList } from '@/components/VulnerabilityList';
import { OsintSection } from '@/components/OsintSection';
import { AuditModal } from '@/components/AuditModal';
import { JsonViewerModal } from '@/components/JsonViewerModal';
import {
  ShieldAlert,
  GitBranch,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  GitCommit,
  Activity,
} from 'lucide-react';

function formatScanDate(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day} UTC`;
  } catch {
    return timestamp.slice(0, 10);
  }
}

const INITIAL_HISTORY: HealthHistoryPoint[] = [
  {
    id: 'pt-1',
    timestamp: '08:00',
    label: 'DeFi Bridge Baseline',
    repo: 'defi-crosschain-bridge',
    score: 52.8,
    risk: 'HIGH',
  },
  {
    id: 'pt-2',
    timestamp: '09:12',
    label: 'FastAPI RAG Ingest',
    repo: 'fastapi-rag-enterprise',
    score: 41.2,
    risk: 'CRITICAL',
  },
  {
    id: 'pt-3',
    timestamp: '10:15',
    label: 'Veritas Hardened Base',
    repo: 'verified-audit-service',
    score: 94.8,
    risk: 'LOW',
  },
  {
    id: 'pt-4',
    timestamp: '10:45',
    label: 'Express Gateway Ingest',
    repo: 'express-payment-gateway',
    score: 34.5,
    risk: 'CRITICAL',
  },
];

export default function SecurityDashboardPage() {
  const [currentReportKey, setCurrentReportKey] = useState<string>('express-payment-gateway');
  const [activeView, setActiveView] = useState<'audit' | 'osint'>('audit');
  const [report, setReport] = useState<SecurityReport>(() => {
    // Clone to prevent mutating original preset
    return JSON.parse(JSON.stringify(SAMPLE_REPORTS['express-payment-gateway']));
  });
  const [osintReport, setOsintReport] = useState<OsintReport>(() => {
    return JSON.parse(JSON.stringify(SAMPLE_OSINT_REPORTS['express-payment-gateway']));
  });

  const [history, setHistory] = useState<HealthHistoryPoint[]>(INITIAL_HISTORY);
  const { isDark, toggleTheme } = useTheme();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);

  const handleSelectSample = (key: string) => {
    if (SAMPLE_REPORTS[key]) {
      const sample = SAMPLE_REPORTS[key];
      setCurrentReportKey(key);
      setReport(JSON.parse(JSON.stringify(sample)));

      if (SAMPLE_OSINT_REPORTS[key]) {
        setOsintReport(JSON.parse(JSON.stringify(SAMPLE_OSINT_REPORTS[key])));
      }

      const timeStr = new Date().toISOString().slice(11, 16);
      const repoName = sample.repository_metadata.repository_url.split('/').pop() || key;
      const label =
        key === 'express-payment-gateway'
          ? 'Express Gateway'
          : key === 'fastapi-rag-enterprise'
          ? 'FastAPI RAG'
          : key === 'solana-defi-bridge'
          ? 'Solana Bridge'
          : 'Clean Baseline';

      setHistory((prev) => [
        ...prev.slice(-9),
        {
          id: `pt-${Date.now()}`,
          timestamp: timeStr,
          label: `${label} Scan`,
          repo: repoName,
          score: sample.repository_metadata.overall_security_score,
          risk: sample.repository_metadata.risk_level,
        },
      ]);
    }
  };

  const handleResetReport = () => {
    if (SAMPLE_REPORTS[currentReportKey]) {
      const sample = SAMPLE_REPORTS[currentReportKey];
      setReport(JSON.parse(JSON.stringify(sample)));

      if (SAMPLE_OSINT_REPORTS[currentReportKey]) {
        setOsintReport(JSON.parse(JSON.stringify(SAMPLE_OSINT_REPORTS[currentReportKey])));
      }

      const timeStr = new Date().toISOString().slice(11, 16);
      const repoName = sample.repository_metadata.repository_url.split('/').pop() || currentReportKey;
      setHistory((prev) => [
        ...prev.slice(-9),
        {
          id: `pt-${Date.now()}`,
          timestamp: timeStr,
          label: 'Reset Triage State',
          repo: repoName,
          score: sample.repository_metadata.overall_security_score,
          risk: sample.repository_metadata.risk_level,
        },
      ]);
    }
  };

  const handleScanComplete = (newReport: SecurityReport, newOsint?: OsintReport) => {
    setCurrentReportKey('custom-scan');
    setReport(JSON.parse(JSON.stringify(newReport)));
    if (newOsint) {
      setOsintReport(JSON.parse(JSON.stringify(newOsint)));
    }

    const timeStr = new Date().toISOString().slice(11, 16);
    const repoName = newReport.repository_metadata.repository_url.split('/').pop() || 'custom-scan';
    setHistory((prev) => [
      ...prev.slice(-9),
      {
        id: `pt-${Date.now()}`,
        timestamp: timeStr,
        label: 'Live AI Audit',
        repo: repoName,
        score: newReport.repository_metadata.overall_security_score,
        risk: newReport.repository_metadata.risk_level,
      },
    ]);
  };

  // Toggle remediation status of an issue and dynamically recalculate health score & metrics
  const handleToggleStatus = (id: string) => {
    setReport((prev) => {
      const updatedVulns = prev.vulnerabilities.map((v) => {
        if (v.id === id) {
          const nextStatus = v.status === 'remediated' ? 'open' : 'remediated';
          return { ...v, status: nextStatus as VulnerabilityFinding['status'] };
        }
        return v;
      });

      // Recalculate remediated count
      const activeVulns = updatedVulns.filter((v) => v.status !== 'remediated');
      const fixedVulns = updatedVulns.filter((v) => v.status === 'remediated');

      // Dynamic Security Score Calculation based on remediations
      const baseOriginalScore = SAMPLE_REPORTS[currentReportKey]?.repository_metadata.overall_security_score || 50;
      const totalPossiblePenalty = 100 - baseOriginalScore;
      const fractionFixed = updatedVulns.length > 0 ? fixedVulns.length / updatedVulns.length : 0;
      const newScore = Math.min(100, Math.round(baseOriginalScore + totalPossiblePenalty * fractionFixed * 0.95));

      // Recompute severity counts for active issues
      const criticalCount = activeVulns.filter((v) => v.severity === 'CRITICAL').length;
      const highCount = activeVulns.filter((v) => v.severity === 'HIGH').length;
      const mediumCount = activeVulns.filter((v) => v.severity === 'MEDIUM').length;
      const lowCount = activeVulns.filter((v) => v.severity === 'LOW').length;
      const infoCount = activeVulns.filter((v) => v.severity === 'INFO').length;

      // Determine risk level based on score
      const newRisk = newScore >= 80 ? 'LOW' : newScore >= 60 ? 'MEDIUM' : newScore >= 45 ? 'HIGH' : 'CRITICAL';

      // Log triage update in health history
      const timeStr = new Date().toISOString().slice(11, 16);
      const repoName = prev.repository_metadata.repository_url.split('/').pop() || 'active-repo';
      const isNowFixed = updatedVulns.find((v) => v.id === id)?.status === 'remediated';
      setHistory((hPrev) => [
        ...hPrev.slice(-9),
        {
          id: `pt-${Date.now()}`,
          timestamp: timeStr,
          label: isNowFixed ? `Fixed ${id}` : `Reopened ${id}`,
          repo: repoName,
          score: newScore,
          risk: newRisk,
        },
      ]);

      return {
        ...prev,
        repository_metadata: {
          ...prev.repository_metadata,
          overall_security_score: newScore,
          risk_level: newRisk,
        },
        metrics_summary: {
          ...prev.metrics_summary,
          severity_counts: {
            critical: criticalCount,
            high: highCount,
            medium: mediumCount,
            low: lowCount,
            info: infoCount,
          },
          chart_payloads: {
            ...prev.metrics_summary.chart_payloads,
            severity_distribution_chart: {
              ...prev.metrics_summary.chart_payloads.severity_distribution_chart,
              data: [criticalCount, highCount, mediumCount, lowCount],
            },
          },
        },
        vulnerabilities: updatedVulns,
      };
    });
  };

  const remediatedCount = report.vulnerabilities.filter((v) => v.status === 'remediated').length;
  const totalCount = report.vulnerabilities.length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentReportKey={currentReportKey}
        onSelectSample={handleSelectSample}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onResetReport={handleResetReport}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Repository Scope Header */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Active Repository Scope
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-xs font-mono text-neutral-500">
                Audited: {formatScanDate(report.repository_metadata.scan_timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-rose-500" />
              {report.repository_metadata.repository_url.startsWith('http') ? (
                <a
                  href={report.repository_metadata.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-semibold text-neutral-900 dark:text-white hover:underline flex items-center gap-1.5"
                >
                  <span>{report.repository_metadata.repository_url}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </a>
              ) : (
                <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                  {report.repository_metadata.repository_url}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              Scan Another Repo or Snippet
            </button>
          </div>
        </div>

        {/* Primary View Switcher: Code Audit vs Git Forensics/OSINT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setActiveView('audit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                activeView === 'audit'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Code Vulnerabilities &amp; Backdoors</span>
              <span className="font-mono text-[10px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded font-bold">
                {report.vulnerabilities.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('osint')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                activeView === 'osint'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <GitCommit className="w-4 h-4 text-cyan-500" />
              <span>Git Forensics &amp; OSINT Intelligence</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  osintReport.security_correlation_score.maintainer_risk_score >= 70
                    ? 'bg-rose-500/15 text-rose-500'
                    : 'bg-emerald-500/15 text-emerald-500'
                }`}
              >
                {osintReport.security_correlation_score.overall_health_verdict.replace(/_/g, ' ')}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
            <span className="flex items-center gap-1">
              <span>Stars:</span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {osintReport.repository_social_metadata.stars_count.toLocaleString()}
              </span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span>Commits:</span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {osintReport.commit_activity_analysis.total_commits}
              </span>
            </span>
          </div>
        </div>

        {activeView === 'audit' ? (
          <>
            {/* Section 1: Scoreboard & Leadership Summary */}
            <Scoreboard
              report={report}
              remediatedCount={remediatedCount}
              totalCount={totalCount}
            />

            {/* Section 2: Real-Time Charts & Metrics */}
            <ChartsSection report={report} isDark={isDark} history={history} />

            {/* Section 3: Vulnerabilities Table & Diff Remediation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    Vulnerability Assessment &amp; Remediation Patches
                  </h2>
                </div>
                <span className="text-xs text-neutral-500">
                  Click any finding to inspect code diffs and exploit scenarios
                </span>
              </div>

              <VulnerabilityList
                vulnerabilities={report.vulnerabilities}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          </>
        ) : (
          <OsintSection
            osintReport={osintReport}
            onOpenOsintJson={() => setIsJsonModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              SentinelAudit Security Suite
            </span>
            <span>·</span>
            <span>OWASP Top 10, CWE-94, CWE-89, CWE-502 &amp; MITRE ATT&amp;CK Audits</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>CVSS v3.1 Engine</span>
            <span>·</span>
            <span>OSINT Forensics Matrix</span>
            <span>·</span>
            <span>JSON Spec v1.4</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onScanComplete={handleScanComplete}
      />

      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        report={report}
        osintReport={osintReport}
        initialTab={activeView === 'osint' ? 'osint' : 'vulnerabilities'}
      />
    </div>
  );
}
