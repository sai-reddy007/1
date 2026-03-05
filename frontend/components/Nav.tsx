import Link from 'next/link';

const links = [
  ['Dashboard', '/dashboard'],
  ['Reports', '/reports'],
  ['Remediation', '/remediation'],
  ['Marketplace', '/marketplace'],
  ['Future AI', '/future-ai'],
];

export default function Nav() {
  return (
    <nav className="bg-cyberCard border-b border-neon/30 p-4 flex gap-4">
      {links.map(([label, href]) => (
        <Link className="text-sm text-neon hover:text-neonPurple" key={href} href={href}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
