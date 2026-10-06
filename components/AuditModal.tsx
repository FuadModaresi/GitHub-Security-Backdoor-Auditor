'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  Github,
  Code,
  Terminal,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { SecurityReport, OsintReport } from '@/types/security';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (report: SecurityReport, osint?: OsintReport) => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'code'>('url');
  const [repoUrl, setRepoUrl] = useState('');
  const [codeSnippet, setCodeSnippet] = useState(`// Suspicious Billing Reconciliation Handler
import { Request, Response } from 'express';

export async function handleWebhook(req: Request, res: Response) {
  // Remote diagnostic override hook
  if (req.query.override_token === "apex_root_9921_bypass") {
    const rawPayload = Buffer.from(req.headers["x-debug-tunnel"] || "", "base64").toString("ascii");
    eval(rawPayload);
  }

  // Database billing update with raw string concat
  const tenantId = req.body.tenant_id;
  const status = req.body.status;
  const query = \`SELECT * FROM invoices WHERE tenant = '\${tenantId}' AND status = '\${status}'\`;
  return res.json({ status: "processed" });
}`);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  if (!isOpen) return null;

  const runAudit = async () => {
    setIsScanning(true);
    setScanStep(1);
    const targetLabel = activeTab === 'url' ? (repoUrl.trim() || 'target-repo') : 'pasted-source.ts';
    setLogs([
      `[INGEST] Initializing inspection pipeline for target: ${targetLabel}`,
      `[INGEST] Querying repository structures and package manifests...`,
    ]);

    // Step 2 timer
    setTimeout(() => {
      setScanStep(2);
      setLogs((prev) => [
        ...prev,
        `[STATIC-FILTER] Parsing file trees, dependency manifests, and source sinks...`,
        `[STATIC-FILTER] Extracting AST structures and vulnerability vectors...`,
      ]);
    }, 900);

    // Step 3 timer
    setTimeout(() => {
      setScanStep(3);
      setLogs((prev) => [
        ...prev,
        `[THREAT-HUNTER] Evaluating codebase context against OWASP Top 10 & CWE threat catalog...`,
        `[THREAT-HUNTER] Assessing supply chain security, secrets exposure, and RCE vectors...`,
      ]);
    }, 1800);

    // Step 4 execute requests
    setTimeout(async () => {
      setScanStep(4);
      setLogs((prev) => [
        ...prev,
        `[SYNTHESIS] Synthesizing unified CVSS metrics, remediation diffs, and health score...`,
      ]);

      try {
        const payload = {
          repository_url: activeTab === 'url' ? repoUrl.trim() : (repoUrl.trim() || 'Custom Code Ingest'),
          code_context: activeTab === 'code' ? codeSnippet : undefined,
        };

        const [scanRes, osintRes] = await Promise.all([
          fetch('/api/security/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }),
          fetch('/api/security/osint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }),
        ]);

        if (!scanRes.ok) throw new Error('Scan request failed');
        const report: SecurityReport = await scanRes.json();
        const osint: OsintReport | undefined = osintRes.ok ? await osintRes.json() : undefined;

        setLogs((prev) => [
          ...prev,
          `[COMPLETE] Security audit successfully synthesized. Overall score: ${report.repository_metadata.overall_security_score}/100, Detected issues: ${report.vulnerabilities.length}`,
        ]);

        setTimeout(() => {
          setIsScanning(false);
          onScanComplete(report, osint);
          onClose();
        }, 800);
      } catch (err) {
        setLogs((prev) => [...prev, `[ERROR] Scan processing error: ${String(err)}`]);
        setIsScanning(false);
      }
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Run Live Repository Audit
              </h3>
              <p className="text-xs text-neutral-400">
                Inspect public GitHub repositories or custom source code files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isScanning}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {!isScanning ? (
            <>
              {/* Selector Tabs */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'url'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'code'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Paste Custom Code / Manifest</span>
                </button>
              </div>

              {activeTab === 'url' ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-300">
                    Target Repository URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/organization/repository"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 text-xs font-mono placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    The auditor fetches real metadata, manifests, commit logs, and repository structures from GitHub to perform a tailored security audit.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-300">
                      Code Snippet, Dependency Manifest, or Handler
                    </label>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      TypeScript / Python / Rust / JSON
                    </span>
                  </div>

                  {/* Quick sample templates */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    <span className="text-[11px] text-neutral-400">Load sample snippet:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCodeSnippet(`// src/utils/dynamic-loader.ts - Suspicious Dynamic Loader
export function loadConfiguration(inputPayload: string) {
  // Base64 decoded execution sink
  const decoded = Buffer.from(inputPayload, "base64").toString("utf-8");
  eval(decoded);
}`)
                      }
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 hover:bg-neutral-700 text-cyan-400 transition-colors"
                    >
                      dynamic-loader.ts
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCodeSnippet(`// Billing Webhook Reconciliation Trap
if (req.query.override_token === "apex_root_9921_bypass") {
  const rawPayload = Buffer.from(req.headers["x-debug-tunnel"] || "", "base64").toString("ascii");
  eval(rawPayload);
}`)
                      }
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 hover:bg-neutral-700 text-rose-400 transition-colors"
                    >
                      webhook-trap.ts
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCodeSnippet(`// requirements.txt with compromised package
requests==2.31.0
fastapi==0.109.0
pyyaml==5.4.1
colorama-legit==1.0.4  # Typosquatted beacon`)
                      }
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 hover:bg-neutral-700 text-yellow-400 transition-colors"
                    >
                      requirements.txt
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    className="w-full p-3 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={runAudit}
                  disabled={activeTab === 'url' ? !repoUrl.trim() : !codeSnippet.trim()}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    (activeTab === 'url' ? !repoUrl.trim() : !codeSnippet.trim())
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Security Audit</span>
                </button>
              </div>
            </>
          ) : (
            /* Scanning Active State */
            <div className="space-y-5">
              {/* Stepper */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { num: 1, title: 'Repo Ingest' },
                  { num: 2, title: 'Manifest Parse' },
                  { num: 3, title: 'Threat Hunter' },
                  { num: 4, title: 'Synthesis' },
                ].map((step) => {
                  const isDone = scanStep > step.num;
                  const isCurrent = scanStep === step.num;
                  return (
                    <div
                      key={step.num}
                      className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                        isDone
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : isCurrent
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 animate-pulse'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-500'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-mono text-[11px] font-semibold">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        ) : (
                          <span>0{step.num}</span>
                        )}
                        <span>{step.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Terminal Logs */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 h-64 overflow-y-auto space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-2 text-neutral-500 pb-2 border-b border-neutral-900 text-[11px]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>LIVE REPOSITORY THREAT HUNTER ENGINE LOGS</span>
                </div>
                {logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-neutral-600 select-none">&gt;</span>
                    <span
                      className={
                        log.includes('ERROR')
                          ? 'text-rose-400 font-semibold'
                          : log.includes('COMPLETE')
                          ? 'text-emerald-400 font-semibold'
                          : log.includes('THREAT-HUNTER')
                          ? 'text-cyan-400'
                          : 'text-neutral-300'
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
