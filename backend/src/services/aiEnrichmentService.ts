type Enrichment = {
  normalizedName: string;
  cwe?: string;
  cve?: string;
  owaspCategory?: string;
  mitreTechnique?: string;
  capecPattern?: string;
  remediationGuidance: string;
};

const rules: Record<string, Omit<Enrichment, 'normalizedName'>> = {
  'sql injection': {
    cwe: 'CWE-89',
    cve: 'CVE-2023-34362',
    owaspCategory: 'A03:2021 Injection',
    mitreTechnique: 'T1190',
    capecPattern: 'CAPEC-66',
    remediationGuidance: 'Use parameterized queries and strict input validation.',
  },
  'cross-site scripting': {
    cwe: 'CWE-79',
    cve: 'CVE-2023-24488',
    owaspCategory: 'A03:2021 Injection',
    mitreTechnique: 'T1059',
    capecPattern: 'CAPEC-63',
    remediationGuidance: 'Escape untrusted output and implement CSP.',
  },
  'open port': {
    cwe: 'CWE-200',
    owaspCategory: 'A05:2021 Security Misconfiguration',
    mitreTechnique: 'T1046',
    capecPattern: 'CAPEC-17',
    remediationGuidance: 'Close unnecessary ports and enforce network ACLs.',
  },
  'weak tls configuration': {
    cwe: 'CWE-327',
    owaspCategory: 'A02:2021 Cryptographic Failures',
    mitreTechnique: 'T1557',
    capecPattern: 'CAPEC-94',
    remediationGuidance: 'Disable legacy ciphers and enforce TLS 1.2+.',
  },
};

export const enrichVulnerability = (name: string): Enrichment => {
  const key = name.trim().toLowerCase();
  const rule = rules[key] || {
    remediationGuidance: 'Apply security best practices and verify with retesting.',
  };

  return {
    normalizedName: key.replace(/\b\w/g, (m) => m.toUpperCase()),
    ...rule,
  };
};

export const detectDuplicate = (existing: string[], candidate: string) => {
  const normalized = candidate.trim().toLowerCase();
  return existing.some((item) => item.trim().toLowerCase() === normalized);
};
