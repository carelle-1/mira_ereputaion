import { AppShell } from '@/components/app-shell';
import { CrisisView } from '@/components/views/alerts-crisis';
export default function CrisePage() {
  return <AppShell section="crise"><CrisisView /></AppShell>;
}