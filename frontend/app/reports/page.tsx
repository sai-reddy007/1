'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    apiGet('/reports', token).then(setReports).catch(() => null);
  }, []);
  return <div className="space-y-3">{reports.map((r) => <div className="bg-cyberCard p-3 rounded" key={r.id}>{r.filename} · {r.sourceTool}</div>)}</div>;
}
