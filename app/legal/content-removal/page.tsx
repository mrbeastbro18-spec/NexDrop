import { LegalPage } from '@/components/legal-page';

export default function ContentRemovalPage() {
  return (
    <LegalPage
      eyebrow="Policy"
      title="Content Removal Policy"
      intro="NexDrop may remove content that violates policy, is reported by a rights holder, or presents a security, legal, or operational risk."
      links={[{ href: '/legal/acceptable-use', label: 'Acceptable Use' }, { href: '/legal/ip-infringement', label: 'IP Reports' }]}
      sections={[
        {
          title: 'Removal reasons',
          body: ['Content may be removed for infringement, malware, abuse, spam, privacy violations, or other policy violations.']
        },
        {
          title: 'Notice and review',
          body: ['Where appropriate, we will provide notice and a way to contest the removal, except where immediate action is needed to limit harm.']
        },
        {
          title: 'Appeals',
          body: ['Users may appeal removal decisions through support or the abuse contact channel identified in the platform.']
        },
        {
          title: 'Preservation',
          body: ['When content is removed, related records may be preserved for security, dispute resolution, or legal compliance.']
        }
      ]}
    />
  );
}