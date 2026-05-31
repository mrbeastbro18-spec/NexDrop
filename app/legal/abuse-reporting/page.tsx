import { LegalPage } from '@/components/legal-page';

export default function AbuseReportingPage() {
  return (
    <LegalPage
      eyebrow="Policy"
      title="Abuse Reporting Policy"
      intro="If you encounter spam, phishing, malware, or account abuse on NexDrop, this policy explains how to report it and what information helps us respond quickly."
      links={[{ href: '/legal/acceptable-use', label: 'Acceptable Use' }, { href: '/legal/security-disclosure', label: 'Security Disclosure' }]}
      sections={[
        {
          title: 'What to include',
          body: ['Provide the relevant URL, a description of the abuse, screenshots if available, and any account or file identifiers that help us investigate.']
        },
        {
          title: 'How we respond',
          body: ['We review reports, restrict harmful activity where necessary, and preserve logs for security and investigation purposes.']
        },
        {
          title: 'Urgent threats',
          body: ['For active compromise, malware distribution, or credential theft, include enough detail for immediate containment and remediation.']
        },
        {
          title: 'Follow-up',
          body: ['We may contact the reporter for clarification, though we may not disclose enforcement details that would create additional risk.']
        }
      ]}
    />
  );
}