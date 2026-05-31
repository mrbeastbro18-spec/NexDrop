import { LegalPage } from '@/components/legal-page';

export default function AcceptableUsePage() {
  return (
    <LegalPage
      eyebrow="Policy"
      title="Acceptable Use Policy"
      intro="NexDrop is designed for legitimate file storage and sharing. This policy explains what users may and may not do when using the platform."
      links={[{ href: '/legal/privacy', label: 'Privacy' }, { href: '/legal/terms', label: 'Terms' }]}
      sections={[
        {
          title: 'Allowed use',
          body: ['Use the service to upload, organize, preview, and share lawful files that you have the right to store or distribute.']
        },
        {
          title: 'Disallowed content',
          body: ['Do not upload malware, phishing kits, spam, illegal material, stolen credentials, or content that infringes rights or violates law.']
        },
        {
          title: 'Service abuse',
          body: ['Do not attempt to evade quotas, automate abusive requests, brute force accounts, or interfere with the availability of the platform.']
        },
        {
          title: 'Enforcement',
          body: ['We may remove content, restrict features, suspend accounts, or preserve logs when abuse or policy violations are detected.']
        }
      ]}
    />
  );
}