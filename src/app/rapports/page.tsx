'use client';
import { AppShell } from '@/components/app-shell';
import { Panel, Button } from '@/components/ui';
import { useWorkspace } from '@/components/workspace-context';
export default function RapportsPage() {
  const { data, generateReport, downloadReport, detail } = useWorkspace();
  return <AppShell section="rapports">
    <div className="section-page">
      <Panel title="Rapports & statistiques" icon="bars">
        <div className="reports-list">
          {data.reports.map(report => (
            <button key={report.id} className="report-item" onClick={() => detail(report)}>
              <strong>{report.name}</strong>
              <span>{report.category} — {report.status}</span>
            </button>
          ))}
        </div>
        <Button variant="primary" icon="plus" onClick={() => void generateReport()}>Générer un rapport</Button>
      </Panel>
    </div>
  </AppShell>;
}