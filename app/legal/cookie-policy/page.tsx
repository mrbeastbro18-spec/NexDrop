import { LegalPage } from '@/components/legal-page';

export default function CookiePolicyPage() {
  return (
    <LegalPage
      eyebrow="Policy"
      title="Cookie Policy"
      intro="This page explains how NexDrop uses cookies and similar technologies to keep sessions secure and the platform functional."
      links={[{ href: '/legal/privacy', label: 'Privacy' }, { href: '/legal/terms', label: 'Terms' }]}
      sections={[
        {
          title: 'Essential cookies',
          body: ['We use cookies for authentication, CSRF protection, and session continuity. These are required for core functionality.']
        },
        {
          title: 'Security cookies',
          body: ['Security-related cookies help detect suspicious activity and protect against session hijacking and request forgery.']
        },
        {
          title: 'No marketing defaults',
          body: ['NexDrop does not require advertising or tracking cookies for the core product experience.']
        },
        {
          title: 'Your controls',
          body: ['You can clear cookies through your browser settings, but doing so may sign you out or break some service features.']
        }
      ]}
    />
  );
}