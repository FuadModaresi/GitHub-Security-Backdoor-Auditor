import { OsintReport } from '@/types/security';

export const SAMPLE_OSINT_REPORTS: Record<string, OsintReport> = {
  'express-payment-gateway': {
    repository_social_metadata: {
      repository_url: 'https://github.com/apex-corp/express-payment-gateway',
      stars_count: 8420,
      forks_count: 312,
      watchers_count: 98,
      open_issues_count: 42,
      contributors_count: 3,
      project_age_years: 5.2,
      last_commit_date: '2026-10-04T19:22:10Z',
    },
    commit_activity_analysis: {
      total_commits: 640,
      commit_frequency_status: 'SUDDENLY_REVIVED',
      developer_distribution: 'ANONYMOUS_AUTHOR',
      suspicious_git_patterns_detected: true,
      forensic_notes: 'Repository was completely dormant for 18 consecutive months with zero commits or release tags. On October 2, an unverified committer handle ("ghost-apex-dev") obtained write access and executed a force-push overwriting 14 history refs, followed by a silent minor version bump introducing obscure dynamic eval handlers and unpinned dependencies.',
    },
    security_correlation_score: {
      social_trust_score: 38.0,
      maintainer_risk_score: 92.5,
      overall_health_verdict: 'HIGH_RISK_TAKEOVER',
    },
    risk_factors: [
      {
        factor_id: 'RF-001',
        category: 'Project Lifecycle & Abandonment',
        severity: 'CRITICAL',
        title: 'Sudden Dormancy Reactivation (Supply Chain Hijack Vector)',
        description: 'The project had 0 commits between April 2025 and October 2026. A sudden wave of commits from a previously unseen committer account strongly correlates with an abandoned package takeover or hijacked maintainer credentials.',
      },
      {
        factor_id: 'RF-002',
        category: 'Commit History & Forensics',
        severity: 'CRITICAL',
        title: 'Force-Push Overwriting Main Branch History',
        description: 'Git reflog forensics reveal a non-fast-forward push to the default branch on October 3, 2026, deleting previous release tags and masking previous code provenance.',
      },
      {
        factor_id: 'RF-003',
        category: 'Developer Forensics',
        severity: 'HIGH',
        title: 'Unverified Commits & Single Anonymous Maintainer',
        description: '100% of the recent commits lack verified GPG signatures and originate from an author identity created less than 14 days ago with zero prior public GitHub history.',
      },
      {
        factor_id: 'RF-004',
        category: 'Social Trust Signals',
        severity: 'MEDIUM',
        title: 'Stagnant Community Turnover vs High Star Count',
        description: 'High star count (8,420) inherited from legacy popularity with completely stalled community PR turnover indicates a high blast radius if downstream packages auto-update.',
      },
    ],
    executive_summary: 'Forensic timeline analysis indicates a critical supply chain takeover profile. The repository was dormant for over 18 months before being reactivated by an unverified anonymous author who force-pushed code changes containing remote evaluation backdoors. Immediate embargo of package distributions and API credential revocation is strongly advised.',
  },

  'fastapi-rag-enterprise': {
    repository_social_metadata: {
      repository_url: 'https://github.com/hyper-scale/fastapi-rag-enterprise',
      stars_count: 14200,
      forks_count: 185,
      watchers_count: 64,
      open_issues_count: 78,
      contributors_count: 2,
      project_age_years: 1.4,
      last_commit_date: '2026-10-05T06:14:00Z',
    },
    commit_activity_analysis: {
      total_commits: 210,
      commit_frequency_status: 'MODERATE',
      developer_distribution: 'SINGLE_MAINTAINER',
      suspicious_git_patterns_detected: true,
      forensic_notes: 'Extreme anomaly detected in star-to-fork ratio (14,200 stars vs only 185 forks). Commit timeline reveals automated batch commits occurring precisely at 03:00 UTC with identical commit messages. Commits include large obfuscated binary vector blobs committed directly into git history.',
    },
    security_correlation_score: {
      social_trust_score: 45.0,
      maintainer_risk_score: 78.0,
      overall_health_verdict: 'CAUTION_STALE_PROJECT',
    },
    risk_factors: [
      {
        factor_id: 'RF-101',
        category: 'Social Trust Signals',
        severity: 'HIGH',
        title: 'Star Farm / Synthetic Reputation Manipulation',
        description: 'The repository exhibits an artificial star influx (+11,000 stars over a 72-hour window in August 2026) with near-zero fork conversion or issue comments, a pattern consistent with paid star bot farms to manufacture false trust.',
      },
      {
        factor_id: 'RF-102',
        category: 'Developer Forensics',
        severity: 'HIGH',
        title: 'Lone Maintainer with Automated Off-Hours Batch Pushes',
        description: 'Over 94% of repository commits are authored by a single pseudonymous developer with recurring scheduled commits, lacking code reviews or pull request branch protections.',
      },
      {
        factor_id: 'RF-103',
        category: 'Commit History & Forensics',
        severity: 'MEDIUM',
        title: 'Binary Vector Cache Blobs Checked into VCS',
        description: 'Direct inclusion of serialized pickle arrays and large compiled binary blobs directly inside the repository history, increasing vulnerability to malicious deserialization traps.',
      },
    ],
    executive_summary: 'Social metrics analysis reveals synthetic reputation inflation with high star-to-fork anomalies and single-maintainer concentration. Coupled with un-sandboxed pickle deserialization sinks, the repository presents a significant supply chain integrity risk for enterprise deployments.',
  },

  'solana-defi-bridge': {
    repository_social_metadata: {
      repository_url: 'https://github.com/sol-vaults/defi-crosschain-bridge',
      stars_count: 2950,
      forks_count: 640,
      watchers_count: 145,
      open_issues_count: 19,
      contributors_count: 4,
      project_age_years: 2.1,
      last_commit_date: '2026-10-04T14:10:00Z',
    },
    commit_activity_analysis: {
      total_commits: 495,
      commit_frequency_status: 'HIGHLY_ACTIVE',
      developer_distribution: 'SINGLE_MAINTAINER',
      suspicious_git_patterns_detected: true,
      forensic_notes: 'Fast-paced commit frequency, but core smart contract logic and withdrawal processors were authored in a single massive unreviewed commit of +8,400 lines right before mainnet deployment. Author identity lacks public cryptographic attestation.',
    },
    security_correlation_score: {
      social_trust_score: 58.0,
      maintainer_risk_score: 72.0,
      overall_health_verdict: 'HIGH_RISK_TAKEOVER',
    },
    risk_factors: [
      {
        factor_id: 'RF-201',
        category: 'Commit History & Forensics',
        severity: 'CRITICAL',
        title: 'Mass Unreviewed Contract Replacement Prior to Release',
        description: 'Core Anchor contract logic responsible for fund custody and withdraw authorizations was introduced in a monolithic commit without review branches or third-party audit signatures.',
      },
      {
        factor_id: 'RF-202',
        category: 'Developer Forensics',
        severity: 'HIGH',
        title: 'Dominant Contributor Monoculture in Sensitive Contracts',
        description: 'One individual author contributed 91% of total program instructions. Absence of multi-party review or multisig deployment controls represents an extreme key compromise hazard.',
      },
      {
        factor_id: 'RF-203',
        category: 'Project Lifecycle & Abandonment',
        severity: 'MEDIUM',
        title: 'Frequent Rapid Force-Pushes on Feature Branches',
        description: 'Ephemeral branch history frequently rewritten before merges, preventing definitive forensic audit of intermediate iterations.',
      },
    ],
    executive_summary: 'While actively maintained, the project suffers from developer monoculture and rapid unreviewed commits to critical fund custody programs. The absence of multisig branch enforcement and unverified GPG signatures creates substantial risk of unilateral backdooring.',
  },

  'clean-baseline-service': {
    repository_social_metadata: {
      repository_url: 'https://github.com/veritas-security/verified-audit-service',
      stars_count: 18900,
      forks_count: 4200,
      watchers_count: 480,
      open_issues_count: 8,
      contributors_count: 38,
      project_age_years: 6.8,
      last_commit_date: '2026-10-05T09:40:00Z',
    },
    commit_activity_analysis: {
      total_commits: 3420,
      commit_frequency_status: 'HIGHLY_ACTIVE',
      developer_distribution: 'COMMUNITY_DRIVEN',
      suspicious_git_patterns_detected: false,
      forensic_notes: 'Exemplary git provenance and supply chain hygiene. 100% of commits in the default branch are signed with verified organization GPG keys. Strict branch protection with mandatory multi-reviewer PR approvals, reproducible CI build attestations, and linear commit history without force-pushes.',
    },
    security_correlation_score: {
      social_trust_score: 96.5,
      maintainer_risk_score: 6.0,
      overall_health_verdict: 'SECURE_ECOSYSTEM',
    },
    risk_factors: [
      {
        factor_id: 'RF-301',
        category: 'Social Trust Signals',
        severity: 'LOW',
        title: 'High Community Engagement and Balanced Ratio',
        description: 'Healthy star-to-fork ratio (4.5:1), fast issue triage closure rates, and distributed contributor base across verified engineering teams.',
      },
      {
        factor_id: 'RF-302',
        category: 'Commit History & Forensics',
        severity: 'LOW',
        title: 'Cryptographically Verified Commit Provenance',
        description: 'Enforced GPG signing and SLSA Level 3 CI/CD provenance attestations across all tagged releases.',
      },
    ],
    executive_summary: 'The repository represents a highly secure and mature open-source ecosystem. Broad contributor distribution, cryptographically verified commit provenance, and healthy community metrics indicate near-zero supply chain takeover probability.',
  },
};
