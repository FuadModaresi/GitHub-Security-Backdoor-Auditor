export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RepositoryMetadata {
  repository_url: string;
  scan_timestamp: string;
  total_files_scanned: number;
  overall_security_score: number; // Scale 0-100 (100 being completely secure)
  risk_level: RiskLevel;
}

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface VulnerabilityCategories {
  backdoors_and_obfuscation: number;
  injection_flaws: number;
  authentication_and_crypto: number;
  supply_chain_risks: number;
  access_control: number;
}

export interface SeverityDistributionChart {
  type: string;
  labels: string[];
  data: number[];
}

export interface DirectoryRisk {
  path: string;
  risk_score: number;
}

export interface ChartPayloads {
  severity_distribution_chart: SeverityDistributionChart;
  risk_by_directory: DirectoryRisk[];
}

export interface MetricsSummary {
  severity_counts: SeverityCounts;
  vulnerability_categories: VulnerabilityCategories;
  chart_payloads: ChartPayloads;
}

export interface Remediation {
  summary: string;
  secure_code_example: string;
  diff: string;
}

export interface VulnerabilityFinding {
  id: string;
  title: string;
  severity: SeverityLevel;
  cvss_score: number;
  cwe_id: string;
  category: string;
  file_path: string;
  line_number: number;
  snippet: string;
  description: string;
  exploit_scenario: string;
  remediation: Remediation;
  // Local triage state
  status?: 'open' | 'remediated' | 'false_positive' | 'accepted_risk';
  confidence_score?: number;
  remediation_priority?: number;
}

export interface SecurityReport {
  repository_metadata: RepositoryMetadata;
  metrics_summary: MetricsSummary;
  vulnerabilities: VulnerabilityFinding[];
  executive_summary: string;
}

export interface ScanStage {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  log?: string;
  timestamp?: string;
}

export interface HealthHistoryPoint {
  id: string;
  timestamp: string;
  label: string;
  repo: string;
  score: number;
  risk: RiskLevel;
}
