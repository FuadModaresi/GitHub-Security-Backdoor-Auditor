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
  Sparkles,
} from 'lucide-react';
import { SecurityReport } from '@/types/security';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (report: SecurityReport) => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'code'>('url');
  const [repoUrl, setRepoUrl] = useState('https://github.com/apex-corp/express-payment-gateway');
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
    setLogs([
      `[INGEST] Initializing shallow clone: ${activeTab === 'url' ? repoUrl : 'user-pasted-snippet.ts'}`,
      `[INGEST] Pruning binary assets (.png, .mp4, node_modules caches)...`,
    ]);

    // Simulated pipeline progression with real API call
    setTimeout(() => {
      setScanStep(2);
      setLogs((prev) => [
        ...prev,
        `[STATIC-FILTER] Running AST analyzer on parsed code tree...`,
        `[STATIC-FILTER] ALERT: Found dangerous sinks matching /eval\\(/ and /base64/`,
        `[STATIC-FILTER] ALERT: Direct string interpolation detected in query sink`,
      ]);
    }, 1200);

    setTimeout(() => {
      setScanStep(3);
      setLogs((prev) => [
        ...prev,
        `[LLM-HUNTER] Initiating Gemini 3.8 Flash Threat Hunter evaluation...`,
        `[LLM-HUNTER] Evaluating OWASP Top 10, CWE-94 (Dynamic Eval) and CWE-89 (SQLi)...`,
        `[LLM-HUNTER] Calculating CVSS v3.1 vector strings and blast radius metrics...`,
      ]);
    }, 2400);

    setTimeout(async () => {
      setScanStep(4);
      setLogs((prev) => [
        ...prev,
        `[SYNTHESIS] Generating unified git diff remediations...`,
        `[SYNTHESIS] Validating JSON response schema...`,
      ]);

      try {
        const res = await fetch('/api/security/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repository_url: activeTab === 'url' ? repoUrl : 'https://github.com/custom/snippet-audit',
            code_context: activeTab === 'code' ? codeSnippet : undefined,
          }),
        });

        if (!res.ok) throw new Error('Scan request failed');
        const report: SecurityReport = await res.json();

        setLogs((prev) => [
          ...prev,
          `[COMPLETE] Security audit report synthesized successfully. Overall score: ${report.repository_metadata.overall_security_score}/100`,
        ]);

        setTimeout(() => {
          setIsScanning(false);
          onScanComplete(report);
          onClose();
        }, 1000);
      } catch (err) {
        setLogs((prev) => [...prev, `[ERROR] Scan processing error: ${String(err)}`]);
        setIsScanning(false);
      }
    }, 3800);
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
                Initiate Codebase Threat Assessment
              </h3>
              <p className="text-xs text-neutral-400">
                Execute deep scan for backdoors, zero-days, and supply chain traps
              </p>
            </div>
          </div>
          {!isScanning && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!isScanning ? (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800 self-start">
                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'url'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository URL</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
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
                    The auditor simulates shallow git retrieval, parses package dependencies, and feeds AST alerts to Gemini 3.8 Flash.
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
                      reconcile.ts
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCodeSnippet(`# Insecure Pickle Vector Deserializer
raw_bytes = base64.b64decode(request.cached_vector_blob)
vector_state = pickle.loads(raw_bytes)`)
                      }
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 hover:bg-neutral-700 text-yellow-400 transition-colors"
                    >
                      cache.py (pickle RCE)
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
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-900/30"
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
                  { num: 1, title: 'Shallow Clone' },
                  { num: 2, title: 'Static Filters' },
                  { num: 3, title: 'AI Threat Hunter' },
                  { num: 4, title: 'Report Synthesis' },
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
                        log.includes('ALERT')
                          ? 'text-rose-400 font-semibold'
                          : log.includes('COMPLETE')
                          ? 'text-emerald-400 font-semibold'
                          : log.includes('LLM-HUNTER')
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
