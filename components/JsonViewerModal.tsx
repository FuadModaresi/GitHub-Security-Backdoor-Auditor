'use client';

import React, { useState } from 'react';
import { SecurityReport, OsintReport } from '@/types/security';
import { X, Copy, Check, Download, Code2, CheckCircle2, ShieldAlert, GitCommit } from 'lucide-react';

interface JsonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SecurityReport;
  osintReport?: OsintReport;
  initialTab?: 'vulnerabilities' | 'osint';
}

export const JsonViewerModal: React.FC<JsonViewerModalProps> = ({
  isOpen,
  onClose,
  report,
  osintReport,
  initialTab = 'vulnerabilities',
}) => {
  const [activeTab, setActiveTab] = useState<'vulnerabilities' | 'osint'>(initialTab);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentPayload = activeTab === 'vulnerabilities' ? report : osintReport || report;
  const jsonString = JSON.stringify(currentPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const repoName = report.repository_metadata.repository_url
      .split('/')
      .pop() || 'security-audit';
    const prefix = activeTab === 'vulnerabilities' ? 'vulnerability-audit' : 'osint-forensics';
    a.download = `sentinel-${prefix}-${repoName}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col text-neutral-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Machine-Readable JSON Intelligence Artifact
              </h3>
              <p className="text-xs text-neutral-400">
                Directly consumable by automated security pipelines and CI/CD tools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector & Schema Status */}
        <div className="px-6 py-2.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
            <button
              onClick={() => setActiveTab('vulnerabilities')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'vulnerabilities'
                  ? 'bg-neutral-800 text-cyan-400 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Vulnerability Audit JSON</span>
            </button>

            {osintReport && (
              <button
                onClick={() => setActiveTab('osint')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'osint'
                    ? 'bg-neutral-800 text-cyan-400 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Git Forensics &amp; OSINT JSON</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {activeTab === 'vulnerabilities'
                ? 'Section 3 Schema: repo_metadata, metrics, vulns'
                : 'Section 3 OSINT Schema: social_meta, commit_activity, risk_factors'}
            </span>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-neutral-950 text-neutral-300">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>
      </div>
    </div>
  );
};
