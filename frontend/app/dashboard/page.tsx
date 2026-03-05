'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import { AssetExposure, RiskTrend, SeverityPie } from '../../components/ChartPanel';

type Data = {
  totalVulnerabilities: number;
  severityDistribution: Record<string, number>;
  riskTrend: { day: string; risk: number }[];
  assetRiskMap: Record<string, number>;
  remediationProgress: { open: number; resolved: number };
};

export default function DashboardPage() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    apiGet('/dashboard', token).then(setData).catch(() => null);
  }, []);

  if (!data) return <div className="text-neon">Load token via /login to view dashboard.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neon">PentestAI Security Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyberCard p-4 rounded-xl border border-neon/20">Total Findings: {data.totalVulnerabilities}</div>
        <div className="bg-cyberCard p-4 rounded-xl border border-neon/20">Open: {data.remediationProgress.open}</div>
        <div className="bg-cyberCard p-4 rounded-xl border border-neon/20">Resolved: {data.remediationProgress.resolved}</div>
        <div className="bg-cyberCard p-4 rounded-xl border border-neon/20">Attack Surface: External + API</div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-cyberCard p-4 rounded-xl"><SeverityPie data={Object.entries(data.severityDistribution).map(([name, value]) => ({ name, value }))} /></div>
        <div className="bg-cyberCard p-4 rounded-xl"><RiskTrend data={data.riskTrend} /></div>
        <div className="bg-cyberCard p-4 rounded-xl"><AssetExposure data={Object.entries(data.assetRiskMap).map(([name, score]) => ({ name, score }))} /></div>
      </div>
    </div>
  );
}
