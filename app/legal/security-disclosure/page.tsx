import { LegalPage } from '@/components/legal-page';

export default function SecurityDisclosurePage() {
  return (
    <LegalPage
      eyebrow="Policy"
      title="Security Disclosure Policy"
      intro="NexDrop welcomes responsible security research and provides a clear path for reporting vulnerabilities or suspected exposure of user data."
      links={[{ href: '/legal/privacy', label: 'Privacy' }, { href: '/legal/abuse-reporting', label: 'Abuse reporting' }]}
      sections={[
        {
          title: 'Report responsibly',
          body: ['Do not exploit vulnerabilities, access data you do not own, or disrupt service while investigating an issue.']
        },
        {
          title: 'Include details',
          body: ['Share the affected route, impact, reproduction steps, and any evidence that helps us verify the issue quickly.']
        },
        {
          title: 'What we do',
          body: ['We triage reports, validate impact, prioritize fixes, and keep the report confidential where appropriate.']
        },
        {
          title: 'Good-faith research',
          body: ['Good-faith security research conducted under this policy should avoid unnecessary data access and respect user privacy.']
        }
      ]}
    />
  );
}