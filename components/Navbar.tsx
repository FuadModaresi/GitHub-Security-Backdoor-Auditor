'use client';

import React from 'react';
import Image from 'next/image';
import {
  ShieldAlert,
  Moon,
  Sun,
  Code2,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SAMPLE_REPORTS } from '@/data/sample-reports';
import { SecurityReport } from '@/types/security';

interface NavbarProps {
  currentReportKey: string;
  onSelectSample: (key: string) => void;
  onOpenAuditModal: () => void;
  onOpenJsonModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onResetReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentReportKey,
  onSelectSample,
  onOpenAuditModal,
  onOpenJsonModal,
  isDark,
  onToggleTheme,
  onResetReport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-rose-500/30 shadow-sm shadow-rose-500/20 flex items-center justify-center bg-neutral-950">
            <Image
              src="/magic-favicon.jpg"
              alt="SentinelAudit Favicon"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-white">
                GitHub Security &amp; Backdoor Auditor
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-neutral-700">
                Threat Hunter
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
              Zero-Day &amp; Backdoor Codebase Auditor
            </p>
          </div>
        </div>

        {/* Center: Repository Preset Picker */}
        <div className="hidden lg:flex items-center gap-2 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs">
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 px-2">
            Target Repo:
          </span>
          <button
            onClick={() => onSelectSample('express-payment-gateway')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              currentReportKey === 'express-payment-gateway'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Express Gateway (Backdoors)
          </button>
          <button
            onClick={() => onSelectSample('fastapi-rag-enterprise')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              currentReportKey === 'fastapi-rag-enterprise'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            FastAPI RAG (RCE &amp; SSRF)
          </button>
          <button
            onClick={() => onSelectSample('solana-defi-bridge')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              currentReportKey === 'solana-defi-bridge'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Solana Bridge (Auth)
          </button>
          <button
            onClick={() => onSelectSample('clean-baseline-service')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              currentReportKey === 'clean-baseline-service'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Clean Baseline (94.8%)
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {/* Quick audit trigger */}
          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">New Audit</span>
          </button>

          {/* Raw JSON viewer */}
          <button
            onClick={onOpenJsonModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
            title="Inspect Machine-Readable JSON Report"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">JSON Report</span>
          </button>

          {/* Reset changes button */}
          <button
            onClick={onResetReport}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Reset triage status"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
