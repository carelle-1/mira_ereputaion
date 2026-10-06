'use client';
import { AppShell } from '@/components/app-shell';
import { Panel } from '@/components/ui';
import { useWorkspace } from '@/components/workspace-context';
export default function ParametresPage() {
  const { data } = useWorkspace();
  const settings = data.settings[0] || {};
  return <AppShell section="parametres">
    <div className="section-page">
      <Panel title="Paramètres du compte" icon="settings">
        <dl className="detail-metadata">
          <div><dt>Email</dt><dd>{settings.email || '—'}</dd></div>
          <div><dt>Langue</dt><dd>{settings.languages || 'Français'}</dd></div>
          <div><dt>Alertes email</dt><dd>{settings.emailAlerts ? 'Activées' : 'Désactivées'}</dd></div>
          <div><dt>Alertes push</dt><dd>{settings.pushAlerts ? 'Activées' : 'Désactivées'}</dd></div>
        </dl>
      </Panel>
    </div>
  </AppShell>;
}