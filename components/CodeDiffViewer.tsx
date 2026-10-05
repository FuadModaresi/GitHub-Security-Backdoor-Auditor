'use client';

import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

interface CodeDiffViewerProps {
  diff: string;
  filePath: string;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ diff, filePath }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = diff.split('\n');

  return (
    <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-950 border-b border-neutral-800 text-neutral-400">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-sans font-medium text-neutral-300 text-xs">{filePath}</span>
          <span className="text-[10px] text-neutral-500">Unified Patch</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-[11px]"
          title="Copy patch diff"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy Diff'}</span>
        </button>
      </div>

      <div className="p-2 overflow-x-auto max-h-72 leading-relaxed">
        {lines.map((line, idx) => {
          let lineClass = 'text-neutral-400';
          let bgClass = 'bg-transparent';
          let prefix = ' ';

          if (line.startsWith('---') || line.startsWith('+++')) {
            lineClass = 'text-neutral-500 font-bold';
            bgClass = 'bg-neutral-900/50';
          } else if (line.startsWith('@@')) {
            lineClass = 'text-cyan-400 font-semibold';
            bgClass = 'bg-cyan-950/30';
          } else if (line.startsWith('+')) {
            lineClass = 'text-emerald-300';
            bgClass = 'bg-emerald-950/40 border-l-2 border-emerald-500';
            prefix = '+';
          } else if (line.startsWith('-')) {
            lineClass = 'text-rose-300';
            bgClass = 'bg-rose-950/40 border-l-2 border-rose-500';
            prefix = '-';
          }

          return (
            <div
              key={idx}
              className={`flex items-start px-2 py-0.5 font-mono ${bgClass} ${lineClass} hover:bg-neutral-800/40 transition-colors`}
            >
              <span className="w-8 select-none text-[10px] text-neutral-600 text-right pr-2">
                {idx + 1}
              </span>
              <pre className="font-mono whitespace-pre-wrap break-all flex-1 text-xs">
                {line}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};
