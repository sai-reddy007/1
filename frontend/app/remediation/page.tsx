'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';

export default function RemediationPage() {
  const [vulns, setVulns] = useState<any[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    apiGet('/vulnerabilities', token).then(setVulns).catch(() => null);
  }, []);
  return (
    <div className="space-y-3">
      {vulns.map((v) => (
        <div className="bg-cyberCard p-4 rounded border border-neon/20" key={v.id}>
          <div className="font-semibold text-neon">{v.vulnerabilityName}</div>
          <div>Risk: {v.riskScore} | Status: {v.status}</div>
        </div>
      ))}
    </div>
  );
}
