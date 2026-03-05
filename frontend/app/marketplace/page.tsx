export default function MarketplacePage() {
  const services = ['Web Application Pentest', 'API Security Assessment', 'Network Pentest', 'Cloud Security Assessment', 'Red Team Engagement'];
  return <div className="grid md:grid-cols-2 gap-4">{services.map((service) => <div className="bg-cyberCard p-4 rounded border border-neon/20" key={service}>{service}</div>)}</div>;
}
