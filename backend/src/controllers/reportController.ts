import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../utils/prisma';
import { enrichVulnerability } from '../services/aiEnrichmentService';
import { calculateRiskScore } from '../services/riskService';
import { parseJsonReport, parseNessus, parseNmap, parsePdfReport, parseXmlReport } from '../parsers/reportParser';
import { logAudit } from '../services/auditService';

const getParser = (sourceTool: string, extension: string) => {
  if (sourceTool.toLowerCase() === 'nmap') return parseNmap;
  if (sourceTool.toLowerCase() === 'nessus') return parseNessus;
  if (extension === '.json') return parseJsonReport;
  if (extension === '.xml') return parseXmlReport;
  if (extension === '.pdf') return parsePdfReport;
  return parseJsonReport;
};

export const uploadReport = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'File is required' });
  if (!req.user?.organizationId) return res.status(403).json({ message: 'Organization required' });

  const { projectId, sourceTool } = req.body;
  const ext = path.extname(req.file.originalname).toLowerCase();

  if (!projectId) {
    await fs.unlink(req.file.path).catch(() => undefined);
    return res.status(400).json({ message: 'projectId is required' });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: req.user.organizationId },
    select: { id: true },
  });

  if (!project) {
    await fs.unlink(req.file.path).catch(() => undefined);
    return res.status(404).json({ message: 'Project not found in your organization' });
  }

  const parser = getParser(sourceTool || '', ext);
  const parsedFindings = await parser(req.file.path);

  const report = await prisma.report.create({
    data: {
      filename: req.file.originalname,
      sourceTool: sourceTool || 'Manual',
      format: ext.replace('.', ''),
      organizationId: req.user.organizationId,
      projectId,
      status: 'PROCESSED',
    },
  });

  for (const finding of parsedFindings) {
    const enriched = enrichVulnerability(finding.vulnerabilityName);
    const asset = finding.affectedAsset
      ? await prisma.asset.upsert({
          where: {
            organizationId_name: {
              organizationId: req.user.organizationId,
              name: finding.affectedAsset,
            },
          },
          update: {},
          create: {
            name: finding.affectedAsset,
            type: 'HOST',
            organizationId: req.user.organizationId,
          },
        })
      : null;

    await prisma.vulnerability.create({
      data: {
        vulnerabilityName: finding.vulnerabilityName,
        normalizedName: enriched.normalizedName,
        severity: finding.severity,
        cvssScore: finding.cvssScore,
        cve: enriched.cve,
        cwe: enriched.cwe,
        owaspCategory: enriched.owaspCategory,
        mitreTechnique: enriched.mitreTechnique,
        capecPattern: enriched.capecPattern,
        description: finding.description,
        affectedEndpoint: finding.affectedEndpoint,
        evidence: finding.evidence,
        remediation: `${finding.remediation} ${enriched.remediationGuidance}`,
        references: finding.references,
        riskScore: calculateRiskScore({ severity: finding.severity, cvssScore: finding.cvssScore }),
        organizationId: req.user.organizationId,
        projectId,
        reportId: report.id,
        assetId: asset?.id,
      },
    });
  }

  await logAudit('REPORT_UPLOADED', { reportId: report.id, findings: parsedFindings.length }, req.user.userId, req.user.organizationId);
  await fs.unlink(req.file.path).catch(() => undefined);
  return res.status(201).json({ reportId: report.id, findings: parsedFindings.length });
};

export const listReports = async (req: Request, res: Response) => {
  const reports = await prisma.report.findMany({ where: { organizationId: req.user?.organizationId } });
  return res.json(reports);
};

