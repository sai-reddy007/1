import { Severity } from '@prisma/client';

const severityWeight: Record<Severity, number> = {
  CRITICAL: 10,
  HIGH: 7,
  MEDIUM: 4,
  LOW: 1,
};

type RiskInput = {
  severity: Severity;
  cvssScore?: number | null;
  exploitAvailable?: boolean;
  assetCriticality?: number;
  exposureLevel?: number;
};

export const calculateRiskScore = ({
  severity,
  cvssScore,
  exploitAvailable = false,
  assetCriticality = 3,
  exposureLevel = 3,
}: RiskInput): number => {
  const base = severityWeight[severity] * 5;
  const cvss = (cvssScore || 0) * 3;
  const exploit = exploitAvailable ? 15 : 0;
  const asset = assetCriticality * 4;
  const exposure = exposureLevel * 3;
  return Math.min(100, Math.round(base + cvss + exploit + asset + exposure));
};

export const calculateAssetRisk = (scores: number[]) => {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};
