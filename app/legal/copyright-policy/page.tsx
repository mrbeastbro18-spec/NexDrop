import { LegalPage } from '@/components/legal-page';

export default function CopyrightPolicyPage() {
  return (
    <LegalPage
      eyebrow="Policy"
      title="Copyright Policy"
      intro="NexDrop respects intellectual property rights and provides a process for reporting copyrighted material that you believe is used without permission."
      links={[{ href: '/legal/ip-infringement', label: 'DMCA / IP' }, { href: '/legal/terms', label: 'Terms' }]}
      sections={[
        {
          title: 'Ownership',
          body: ['Users must only upload or share content they own or are authorized to use, distribute, or license.']
        },
        {
          title: 'Takedown process',
          body: ['Send a detailed notice identifying the work, the location of the content, and your authority to act on behalf of the rights owner.']
        },
        {
          title: 'Counter-notices',
          body: ['If content is removed and you believe it was a mistake, you may submit a counter-notice and we will review it under applicable law.']
        },
        {
          title: 'Repeat infringements',
          body: ['Accounts that repeatedly upload infringing content may be suspended or terminated to protect the platform and rights holders.']
        }
      ]}
    />
  );
}