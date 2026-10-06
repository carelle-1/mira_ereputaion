import { AppShell } from '@/components/app-shell';
import { Panel } from '@/components/ui';
export default function ProtectionPage() {
  return <AppShell section="protection">
    <div className="section-page">
      <Panel title="Protection de l’identité" icon="shield">
        <p>Surveillez et protégez votre identité numérique contre les usurpations et les atteintes à votre réputation.</p>
      </Panel>
    </div>
  </AppShell>;
}