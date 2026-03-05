import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

const orgFilter = (organizationId?: string) => (organizationId ? { organizationId } : {});

export const getDashboard = async (req: Request, res: Response) => {
  const filter = req.user?.role === 'PLATFORM_ADMIN' ? {} : orgFilter(req.user?.organizationId);

  const vulnerabilities = await prisma.vulnerability.findMany({ where: filter, include: { asset: true } });

  const severityDistribution = vulnerabilities.reduce<Record<string, number>>((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {});

  const riskTrend = vulnerabilities.slice(-7).map((v, idx) => ({ day: `D-${6 - idx}`, risk: v.riskScore }));

  const assetRiskMap = vulnerabilities.reduce<Record<string, number>>((acc, v) => {
    const name = v.asset?.name || 'Unknown';
    acc[name] = Math.max(acc[name] || 0, v.riskScore);
    return acc;
  }, {});

  const remediationProgress = vulnerabilities.reduce(
    (acc, v) => {
      if (v.status === 'RESOLVED') acc.resolved += 1;
      else acc.open += 1;
      return acc;
    },
    { open: 0, resolved: 0 }
  );

  return res.json({
    totalVulnerabilities: vulnerabilities.length,
    severityDistribution,
    riskTrend,
    assetRiskMap,
    remediationProgress,
  });
};
