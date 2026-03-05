import fs from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import pdf from 'pdf-parse';

export type ParsedVuln = {
  vulnerabilityName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore?: number;
  description: string;
  affectedAsset?: string;
  affectedEndpoint?: string;
  evidence: string;
  remediation: string;
  references: string;
};

const defaultSeverity = (value: string) => {
  const normalized = value.toUpperCase();
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(normalized)) {
    return normalized as ParsedVuln['severity'];
  }
  return 'MEDIUM';
};

export const parseNmap = async (filepath: string): Promise<ParsedVuln[]> => {
  const xml = await fs.readFile(filepath, 'utf8');
  const parsed = await parseStringPromise(xml);
  const hosts = parsed.nmaprun.host || [];
  return hosts.flatMap((host: any) => {
    const ip = host.address?.[0]?.$.addr;
    const ports = host.ports?.[0]?.port || [];
    return ports
      .filter((p: any) => p.state?.[0]?.$.state === 'open')
      .map((p: any) => ({
        vulnerabilityName: 'Open Port',
        severity: 'LOW' as const,
        cvssScore: 3.1,
        description: `Open port detected: ${p.$.portid}`,
        affectedAsset: ip,
        affectedEndpoint: `${ip}:${p.$.portid}`,
        evidence: JSON.stringify(p),
        remediation: 'Close unused ports and restrict network access.',
        references: 'https://nmap.org/book/man-port-scanning-basics.html',
      }));
  });
};

export const parseNessus = async (filepath: string): Promise<ParsedVuln[]> => {
  const xml = await fs.readFile(filepath, 'utf8');
  const parsed = await parseStringPromise(xml);
  const hosts = parsed.NessusClientData_v2.Report?.[0]?.ReportHost || [];
  return hosts.flatMap((host: any) => {
    const asset = host.$.name;
    const items = host.ReportItem || [];
    return items.map((item: any) => ({
      vulnerabilityName: item.plugin_name?.[0] || 'Nessus Finding',
      severity: defaultSeverity(item.risk_factor?.[0] || 'MEDIUM'),
      cvssScore: Number(item.cvss3_base_score?.[0] || item.cvss_base_score?.[0] || 0),
      description: item.description?.[0] || 'No description',
      affectedAsset: asset,
      affectedEndpoint: item.plugin_output?.[0],
      evidence: item.synopsis?.[0] || 'N/A',
      remediation: item.solution?.[0] || 'Refer to vendor guidance',
      references: item.see_also?.[0] || 'N/A',
    }));
  });
};

export const parseJsonReport = async (filepath: string): Promise<ParsedVuln[]> => {
  const raw = await fs.readFile(filepath, 'utf8');
  const json = JSON.parse(raw);
  const vulns = json.vulnerabilities || json.findings || [];
  return vulns.map((v: any) => ({
    vulnerabilityName: v.vulnerability_name || v.name,
    severity: defaultSeverity(v.severity || 'MEDIUM'),
    cvssScore: Number(v.cvss_score || 0),
    description: v.description || '',
    affectedAsset: v.affected_asset,
    affectedEndpoint: v.affected_endpoint,
    evidence: v.evidence || '',
    remediation: v.remediation || '',
    references: (v.references || []).toString(),
  }));
};

export const parseXmlReport = async (filepath: string): Promise<ParsedVuln[]> => {
  const raw = await fs.readFile(filepath, 'utf8');
  const xml = await parseStringPromise(raw);
  const findings = xml.report?.finding || [];
  return findings.map((f: any) => ({
    vulnerabilityName: f.name?.[0],
    severity: defaultSeverity(f.severity?.[0]),
    cvssScore: Number(f.cvss?.[0] || 0),
    description: f.description?.[0],
    affectedAsset: f.asset?.[0],
    affectedEndpoint: f.endpoint?.[0],
    evidence: f.evidence?.[0],
    remediation: f.remediation?.[0],
    references: f.references?.[0],
  }));
};

export const parsePdfReport = async (filepath: string): Promise<ParsedVuln[]> => {
  const dataBuffer = await fs.readFile(filepath);
  const extracted = await pdf(dataBuffer);
  const matches = extracted.text.match(/(SQL Injection|Cross-Site Scripting|Weak TLS Configuration)/gi) || [];
  return matches.map((m) => ({
    vulnerabilityName: m,
    severity: m.toLowerCase().includes('sql') ? 'CRITICAL' : 'HIGH',
    cvssScore: m.toLowerCase().includes('sql') ? 9.8 : 7.4,
    description: `Extracted from PDF report section: ${m}`,
    evidence: 'Text pattern match from PDF parser',
    remediation: 'Follow secure coding and hardening recommendations.',
    references: 'Internal pentest report',
  }));
};
