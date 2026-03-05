import { PrismaClient, Role, Severity } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateRiskScore } from '../src/services/riskService';
import { enrichVulnerability } from '../src/services/aiEnrichmentService';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-sec' },
    update: {},
    create: { name: 'Acme Security', slug: 'acme-sec' },
  });

  const pass = await bcrypt.hash('ChangeMe123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@acme-sec.com' },
    update: {},
    create: { email: 'admin@acme-sec.com', passwordHash: pass, name: 'Org Admin', role: Role.ORG_ADMIN, organizationId: org.id },
  });

  const project = await prisma.project.create({
    data: { name: 'Q3 External Pentest', description: 'Customer-facing assets review', organizationId: org.id },
  });

  const report = await prisma.report.create({
    data: {
      filename: 'sample-pentest.json',
      sourceTool: 'Manual',
      format: 'json',
      projectId: project.id,
      organizationId: org.id,
    },
  });

  const asset = await prisma.asset.create({
    data: { name: 'api.acme-sec.com', type: 'API', criticality: 5, exposureLevel: 4, organizationId: org.id },
  });

  const findings = [
    { name: 'SQL Injection', severity: Severity.CRITICAL, cvss: 9.8, description: 'Unsanitized user input in login API.' },
    { name: 'Cross-Site Scripting', severity: Severity.HIGH, cvss: 7.4, description: 'Reflected XSS in search endpoint.' },
    { name: 'Open Port', severity: Severity.LOW, cvss: 3.1, description: 'Port 23 exposed externally.' },
    { name: 'Weak TLS Configuration', severity: Severity.MEDIUM, cvss: 5.9, description: 'TLS 1.0 and weak ciphers enabled.' },
  ];

  for (const finding of findings) {
    const enrich = enrichVulnerability(finding.name);
    await prisma.vulnerability.create({
      data: {
        vulnerabilityName: finding.name,
        normalizedName: enrich.normalizedName,
        severity: finding.severity,
        cvssScore: finding.cvss,
        cve: enrich.cve,
        cwe: enrich.cwe,
        owaspCategory: enrich.owaspCategory,
        mitreTechnique: enrich.mitreTechnique,
        capecPattern: enrich.capecPattern,
        description: finding.description,
        affectedEndpoint: '/v1/auth/login',
        evidence: 'Automated and manual exploitation evidence attached.',
        remediation: enrich.remediationGuidance,
        references: 'https://owasp.org',
        riskScore: calculateRiskScore({ severity: finding.severity, cvssScore: finding.cvss, exploitAvailable: true, assetCriticality: 5, exposureLevel: 4 }),
        organizationId: org.id,
        projectId: project.id,
        reportId: report.id,
        assetId: asset.id,
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
