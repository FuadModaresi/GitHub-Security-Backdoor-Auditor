# SentinelAudit: GitHub Security & Backdoor Auditor

An elite Principal Application Security Engineer, Threat Hunter, and Code Auditor platform designed to detect hidden backdoors, zero-days, supply chain compromises, and critical vulnerabilities across multi-language repositories.

Built with **Next.js 15+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **Google GenAI (Gemini 3.8 Flash)**.

---

## 1. Executive Summary & Purpose

Modern software supply chains and microservice architectures are increasingly targeted by sophisticated threat actors using:
- **Obfuscated Logic Traps & Backdoors:** Dormant remote evaluation hooks (`eval()`, Base64 decoding, debug tunnels, external telemetry beacons).
- **Supply Chain Risks:** Malicious package lifecycle hooks (`preinstall`, `postinstall`), unverified dependencies, and dependency confusion.
- **Critical Application Vulnerabilities (OWASP Top 10):** Insecure deserialization (`pickle.loads`, `yaml.load`), Server-Side Request Forgery (SSRF), SQL Injection, Server-Side Template Injection (SSTI), IDOR, and cryptographic weaknesses.

**SentinelAudit** ingests source code or repository manifests, runs static AST and regex pre-filters, passes contextual alerts to a high-reasoning Gemini 3.8 Flash model, and outputs a strict, machine-readable JSON report with interactive telemetry and side-by-side patch diffs.

---

## 2. Technical Architecture & Engineering Pipeline

The auditor operates across a four-stage sequential pipeline designed to maximize detection fidelity while maintaining low token overhead:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SENTINEL AUDIT PIPELINE                           │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ STAGE 1: INGESTION & PRUNING  │ ➔ Shallow clone, manifest isolation
└───────────────────────────────┘   (package.json, Dockerfile, requirements.txt)
          │
          ▼
┌───────────────────────────────┐
│ STAGE 2: STATIC PRE-FILTERING │ ➔ Regex & AST pattern scanner:
└───────────────────────────────┘   Dangerous sinks (eval, pickle, child_process)
          │
          ▼
┌───────────────────────────────┐
│ STAGE 3: GEMINI THREAT HUNTER │ ➔ Gemini 3.8 Flash deep reasoning
└───────────────────────────────┘   CVSS v3.1 scoring, weaponization analysis
          │
          ▼
┌───────────────────────────────┐
│ STAGE 4: SYNTHESIS & DIFFS    │ ➔ Unified patch generation, score calculation,
└───────────────────────────────┘   Recharts telemetry visualization
```

### Stage 1: Ingestion & Code Retrieval
- Clones target repositories shallowly (`git clone --depth 1`) or ingests uploaded code snippets.
- Strips large binary assets, images, media files, and redundant build artifacts (`dist`, `node_modules`, `.git`).
- Extracts dependency manifests (`package.json`, `Cargo.toml`, `requirements.txt`, `go.mod`, `pom.xml`) and security-critical configuration files.

### Stage 2: Static Heuristic Pre-Filtering
- Scans source trees using high-speed AST rules and regular expressions for suspicious indicators:
  - Dynamic code evaluation: `eval(`, `Function(`, `exec(`, `compile(`.
  - Obfuscation indicators: `b64decode`, `Buffer.from(..., "base64")`, hex string arrays.
  - Dangerous process execution: `child_process.exec`, `subprocess.Popen`, `os.system`.
  - Insecure deserialization: `pickle.loads`, `yaml.unsafe_load`, `unserialize(`.
  - Untrusted egress: hardcoded URLs, raw socket connections, unvalidated HTTP webhooks.
- Pre-scanned alerts are batched into the LLM prompt context to focus the model on high-confidence sinks.

### Stage 3: LLM Deep Reasoning & Threat Hunter Analysis
- Invokes **Gemini 3.8 Flash** server-side (`@google/genai`) with low temperature (`0.2`) for deterministic security assessments.
- Evaluates attack paths against **OWASP Top 10**, **CWE definitions**, and **MITRE ATT&CK** matrices.
- Computes CVSS v3.1 base vectors and calculates blast radius, confidence scores, and remediation priority scores.

### Stage 4: Synthesis & Unified Diff Generation
- Formulates complete, syntax-accurate patch diffs (`--- original / +++ fixed`) alongside verified defensive implementations.
- Calculates an Overall Security Health Score (0–100 scale) and assigns repository risk tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

---

## 3. Strict Machine-Readable JSON Contract

All scan results conform strictly to the following machine-readable JSON schema, consumed directly by the dashboard to power real-time charts and triage widgets:

```json
{
  "repository_metadata": {
    "repository_url": "STRING",
    "scan_timestamp": "ISO-8601",
    "total_files_scanned": 0,
    "overall_security_score": 0.0,
    "risk_level": "CRITICAL | HIGH | MEDIUM | LOW"
  },
  "metrics_summary": {
    "severity_counts": {
      "critical": 0,
      "high": 0,
      "medium": 0,
      "low": 0,
      "info": 0
    },
    "vulnerability_categories": {
      "backdoors_and_obfuscation": 0,
      "injection_flaws": 0,
      "authentication_and_crypto": 0,
      "supply_chain_risks": 0,
      "access_control": 0
    },
    "chart_payloads": {
      "severity_distribution_chart": {
        "type": "donut",
        "labels": ["Critical", "High", "Medium", "Low"],
        "data": [0, 0, 0, 0]
      },
      "risk_by_directory": [
        { "path": "src/services/billing", "risk_score": 98 }
      ]
    }
  },
  "vulnerabilities": [
    {
      "id": "VULN-001",
      "title": "Descriptive Title of the Vulnerability",
      "severity": "CRITICAL",
      "cvss_score": 9.8,
      "cwe_id": "CWE-94",
      "category": "Backdoors & Obfuscation",
      "file_path": "src/services/billing/reconcile.ts",
      "line_number": 84,
      "snippet": "const _0x9f = Buffer.from(req.headers['x-debug-tunnel'] || '', 'base64').toString('ascii'); eval(_0x9f);",
      "description": "Explanation of backdoor behavior and threat landscape.",
      "exploit_scenario": "Step-by-step attacker weaponization narrative.",
      "remediation": {
        "summary": "High-level fix guidance",
        "secure_code_example": "secure_code_snippet()",
        "diff": "--- original\n+++ fixed\n..."
      }
    }
  ],
  "executive_summary": "Concise paragraph summarizing health and immediate directives."
}
```

---

## 4. Git History Forensics & OSINT Intelligence Contract

The platform includes an OSINT & Git History Forensics engine correlating social signals and commit timelines with supply chain takeover risks. All OSINT assessments adhere to this strict schema:

```json
{
  "repository_social_metadata": {
    "repository_url": "STRING",
    "stars_count": 0,
    "forks_count": 0,
    "watchers_count": 0,
    "open_issues_count": 0,
    "contributors_count": 0,
    "project_age_years": 0.0,
    "last_commit_date": "ISO-8601"
  },
  "commit_activity_analysis": {
    "total_commits": 0,
    "commit_frequency_status": "HIGHLY_ACTIVE | MODERATE | DORMANT | SUDDENLY_REVIVED",
    "developer_distribution": "COMMUNITY_DRIVEN | SINGLE_MAINTAINER | ANONYMOUS_AUTHOR",
    "suspicious_git_patterns_detected": true,
    "forensic_notes": "Detailed notes on commit history anomalies, force-pushes, or strange activity patterns."
  },
  "security_correlation_score": {
    "social_trust_score": 0.0,
    "maintainer_risk_score": 0.0,
    "overall_health_verdict": "SECURE_ECOSYSTEM | CAUTION_STALE_PROJECT | HIGH_RISK_TAKEOVER"
  },
  "risk_factors": [
    {
      "factor_id": "RF-001",
      "category": "Commit History / Social Metrics",
      "severity": "CRITICAL | HIGH | MEDIUM | LOW",
      "title": "Short title of the risk factor",
      "description": "Explanation of how this commit/social pattern links to a potential security or backdoor vulnerability."
    }
  ],
  "executive_summary": "A concise 3-sentence summary correlating the project's community metrics and commit history with its overall security posture."
}
```

---

## 5. Frontend Engineering & Key Components

### Primary Command Views
- **Code Vulnerabilities & Backdoor Auditor:** Triage code flaws, inspect side-by-side git diffs, examine CVSS base scores, and visualize toxic directories.
- **Git Forensics & OSINT Intelligence:** Investigate star-to-fork anomalies (botting farms), sudden dormancy revivals (maintainer takeovers), single anonymous maintainer monoculture, and force-push history rewrites.

### Real-Time Visualizations (`components/ChartsSection.tsx` & `components/OsintSection.tsx`)
- **Security Health History Line Chart:** Built with Recharts `AreaChart`, visualizing repository `overall_security_score` trends over time (0–100 scale). Displays dynamic score changes (delta $\pm$ points), benchmark reference lines at 80 (Resilient) and 50 (Critical Threshold), an interactive timeline tracking each scan/sample switch and triage action, and custom risk-tier tooltips.
- **Severity Donut Chart:** Built with Recharts `PieChart`, rendering dynamic slices for Critical, High, Medium, and Low tiers. Includes animated hover cards and center totals.
- **Toxic Directory Heatmap:** Horizontal `BarChart` plotting toxic directory scores (0–100 scale), colored by severity thresholds (>90 Toxic, 70–89 High, 40–69 Medium, <40 Low).
- **Threat Vector Breakdown:** Vector classification distribution tracking the top OWASP and ATT&CK categories.
- **Hydration Guard:** Utilizes `useSyncExternalStore` to ensure chart SVG bounding boxes do not trigger React 19 hydration mismatches during server rendering.

### Dynamic Triage & Score Recalculation (`app/page.tsx`)
- Clicking **"Apply Fix"** on any finding updates the vulnerability's status to `remediated`.
- The dashboard dynamically recalculates the **Overall Security Score**, adjusts risk levels, and updates severity distribution charts in real time.

### Patch & Diff Viewer (`components/CodeDiffViewer.tsx`)
- Syntax-highlighted unified patch viewer coloring additions in emerald (`+`) and deletions in rose (`-`).
- Single-click patch copying for seamless integration into pull requests and CI/CD pipelines.

### Threat Case Presets (`data/sample-reports.ts`)
Pre-loaded with deep, production-grade vulnerability cases:
1. **`express-payment-gateway`:** Hidden Base64 eval backdoor in reconciliation and compromised npm supply chain package (`payment-utils-v2`).
2. **`fastapi-rag-enterprise`:** Critical RCE via `pickle.loads` on cached embeddings and internal cloud metadata SSRF.
3. **`solana-defi-bridge`:** Missing signer validation on liquidity withdrawals and cross-chain claim replay vulnerabilities.
4. **`clean-baseline-service`:** 94.8% hardened production reference.

---

## 5. Hydration-Safe React 19 & Next.js Patterns

To prevent SSR / client hydration mismatches:
- **`useTheme` Hook (`hooks/use-theme.ts`):** Uses React's `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`. On SSR and the first hydration tick, `getServerSnapshot()` returns a consistent default (`true`), eliminating server/client branching errors.
- **Deterministic Date Formatting:** Uses a UTC-normalized date formatter (`formatScanDate`) rather than browser-locale-dependent `toLocaleDateString()`.
- **Hydration Suppression:** Added `suppressHydrationWarning` on `<html lang="en">` and `<body>` to support class toggling.

---

## 6. Project Structure

```
├── app/
│   ├── api/
│   │   └── security/
│   │       └── scan/
│   │           └── route.ts         # Server-side Gemini 3.8 Flash audit route
│   ├── globals.css                  # Tailwind CSS v4 & custom variants
│   ├── layout.tsx                   # Root HTML entry with metadata
│   └── page.tsx                     # Main interactive auditor dashboard
├── components/
│   ├── AuditModal.tsx               # Code & URL submission with live logs
│   ├── ChartsSection.tsx            # Recharts donut, bar, and vector charts
│   ├── CodeDiffViewer.tsx           # Unified git diff patch renderer
│   ├── JsonViewerModal.tsx          # Machine-readable JSON spec inspector
│   ├── Navbar.tsx                   # Header, preset selector, and theme toggle
│   ├── Scoreboard.tsx               # Security score gauge & executive summary
│   └── VulnerabilityList.tsx        # Filterable finding cards & diff triage
├── data/
│   └── sample-reports.ts            # Production vulnerability scenarios
├── hooks/
│   ├── use-mobile.ts                # Hydration-safe responsive breakpoint hook
│   └── use-theme.ts                 # useSyncExternalStore dark/light mode hook
├── lib/
│   ├── gemini.ts                    # Google GenAI client initialization
│   └── utils.ts                     # Tailwind class merging helper
├── types/
│   └── security.ts                  # TypeScript interfaces for JSON schema
├── metadata.json                    # AI Studio applet capabilities
└── package.json
```

---

## 7. Development & Deployment

### Prerequisites
- Node.js 20+
- Google Gemini API Key (injected as `GEMINI_API_KEY`)

### Environment Variables
Configure `.env.local` (or supply via environment secrets):
```bash
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"
```

### Installation & Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linter
npm run lint

# Build standalone production bundle
npm run build
```

---

## 8. License
Distributed under the MIT License. Developed for enterprise application security teams, penetration testers, and threat hunters.
