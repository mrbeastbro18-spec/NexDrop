import { LegalPage } from '@/components/legal-page';

export default function DataRetentionPage() {
  return (
    <LegalPage
      eyebrow="Policy"
      title="Data Retention Policy"
      intro="This policy explains how long NexDrop keeps account data, logs, and uploaded files, and what happens when content is deleted or accounts are closed."
      links={[{ href: '/legal/privacy', label: 'Privacy' }, { href: '/legal/data-compliance', label: 'Controls' }]}
      sections={[
        {
          title: 'User files',
          body: ['Uploaded files remain stored until the user deletes them, a retention rule expires, or an account is removed.']
        },
        {
          title: 'Account data',
          body: ['Authentication records and profile data are retained while the account remains active and for a limited period afterward when required for security or legal reasons.']
        },
        {
          title: 'Logs and backups',
          body: ['Operational logs and backups are kept only as long as needed for reliability, diagnostics, security, and recovery.']
        },
        {
          title: 'Deletion requests',
          body: ['When deletion is requested, we remove or anonymize data where feasible and keep only what is needed for legal, operational, or anti-abuse obligations.']
        }
      ]}
    />
  );
}