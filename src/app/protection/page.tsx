'use client';
import { useMemo, useState } from 'react';
import { AppShell, PageHeading } from '@/components/app-shell';
import { LineChart } from '@/components/charts';
import { useWorkspace } from '@/components/workspace-context';
import { Badge, Button, EmptyState, Icon, IconButton, Panel, PlatformIcon } from '@/components/ui';
import type { Entity } from '@/lib/types';

const initialThreats = [
  { name: 'Usurpation d’identité', description: 'Utilisation de votre nom et photo sur un faux compte professionnel', platform: 'linkedin', url: 'https://linkedin.com/in/arnaud-kenne-faux', severity: 'critical', status: 'in_progress', time: '24/05/2025 à 08:15' },
  { name: 'Faux profil', description: 'Profil frauduleux utilisant vos informations personnelles', platform: 'x', url: 'https://twitter.com/arnaudkenne_pro', severity: 'medium', status: 'in_progress', time: '23/05/2025 à 14:37' },
  { name: 'Usurpation de nom', description: 'Votre nom utilisé dans un article sans autorisation', platform: 'web', url: 'https://medium.com/@faux.auteur/article', severity: 'low', status: 'resolved', time: '22/05/2025 à 11:03' },
  { name: 'Site frauduleux', description: 'Site imitant votre activité et votre image', platform: 'web', url: 'https://arnaudkenne-consulting.net', severity: 'critical', status: 'unread', time: '21/05/2025 à 16:22' },
].map((item, i) => ({ ...item, id: `protection-seed-${i}`, type: 'alerts' as const, date: '2025-05-24', author: 'Surveillance GHOSTROAR' }));

export default function ProtectionPage() {
  const { data, edit, save, remove, openModal, notify, analyze } = useWorkspace();
  const [filter, setFilter] = useState('Toutes');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const alerts = data.alerts.filter(a => a.category === 'identity' || a.category === 'protection' || /usurp|identité|faux profil|frauduleux/i.test(`${a.name} ${a.description || ''}`));
    const all = [...initialThreats.filter(seed => !alerts.some(a => a.name === seed.name)), ...alerts];
    return all.filter(item => {
      const statusMatch = filter === 'Toutes' || (filter === 'Actives' && item.status !== 'resolved') || (filter === 'Résolues' && item.status === 'resolved') || (filter === 'Faux profils' && /faux profil|usurpation/i.test(item.name));
      return statusMatch && `${item.name} ${item.description || ''} ${item.url || ''}`.toLowerCase().includes(query.toLowerCase());
    });
  }, [data.alerts, filter, query]);
  async function update(item: Entity, values: Partial<Entity>) { const result = await save('alerts', values, item.id); if (result) notify(values.status === 'resolved' ? 'La menace a été marquée comme résolue.' : 'La menace a été mise à jour.'); }
  async function addThreat() { edit('alerts', undefined, { name: 'Nouvelle menace d’identité', description: '', platform: 'web', category: 'identity', severity: 'medium', status: 'unread', author: 'Surveillance identité' }); }
  const active = rows.filter(item => item.status !== 'resolved');
  return <AppShell section="protection"><div className="section-page protection-page">
    <PageHeading title="Protection de l’identité" subtitle="Surveillez les faux profils et gérez les menaces qui ciblent votre identité numérique." active><span className="protection-updated"><Icon name="clock" size={15} /> Dernière mise à jour : 24 mai 2025 à 09:42</span></PageHeading>
    <div className="protection-layout"><div className="protection-main">
      <div className="protection-metrics"><div className="protection-stat green"><Icon name="shield"/><span>Niveau de risque<strong>FAIBLE</strong><b>18<small>/100</small></b><i><em/></i></span></div><div className="protection-stat orange"><Icon name="eye"/><span>Faux profils détectés<strong>{rows.filter(r=>/faux profil|usurpation/i.test(r.name)).length}</strong></span></div><div className="protection-stat blue"><Icon name="activity"/><span>Surveillances actives<strong>{Math.max(1, data.sources.filter(s=>s.active).length)}</strong></span></div><div className="protection-stat green"><Icon name="success"/><span>Menaces résolues<strong>{rows.filter(r=>r.status==='resolved').length}</strong></span></div></div>
      <Panel title="Identité protégée" icon="shield" className="identity-panel"><div className="identity-items"><div><Icon name="user"/><span><small>Nom complet</small><strong>{data.profile[0]?.name || 'Arnaud Kenne'}</strong></span><Badge status="active" subtle>Vérifié</Badge></div><div><Icon name="camera"/><span><small>Photo officielle</small><strong>Vérifiée</strong></span><Badge status="active" subtle>Vérifié</Badge></div><div><Icon name="users"/><span><small>Comptes sociaux</small><strong className="identity-social"><PlatformIcon platform="linkedin" size="small"/><PlatformIcon platform="x" size="small"/><PlatformIcon platform="instagram" size="small"/><PlatformIcon platform="youtube" size="small"/></strong><small>Vérifiés</small></span></div><div><Icon name="globe"/><span><small>Site web</small><strong>{data.profile[0]?.url?.replace(/^https?:\/\//,'') || 'kenne-consulting.com'}</strong></span><Badge status="active" subtle>Vérifié</Badge></div></div></Panel>
      <div className="threat-toolbar"><div className="filter-tabs">{['Toutes','Actives','Résolues','Faux profils'].map(tab=><button key={tab} className={filter===tab?'selected':''} onClick={()=>setFilter(tab)}>{tab}</button>)}</div><label className="table-search"><Icon name="search" size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher une menace, source ou mot clé…"/></label><Button variant="primary" icon="plus" onClick={addThreat}>Ajouter une surveillance</Button></div>
      <div className="threat-list">{rows.length ? rows.map(item=><article className="threat-card" key={item.id}>
        <div className={`threat-mark ${item.severity}`}><Icon name={item.severity==='low'?'edit':'user'} size={23}/></div>
        <div className="threat-copy"><h3>{item.name}</h3><p>{item.description}</p><a href={item.url || '#'} target={item.url?'_blank':undefined} rel="noreferrer">{item.url || 'Source à renseigner'}</a></div>
        <div className="threat-severity"><Badge status={item.severity||'medium'} subtle>{item.severity==='critical'?'Critique':item.severity==='medium'?'Moyen':'Faible'}</Badge></div>
        <div className="threat-report-actions"><small>Détecté le {item.time || item.date}</small><div><Button icon="alert" onClick={()=>openModal({kind:'communication',entity:item,title:'Signaler cette usurpation'})}>Signaler</Button><Button icon="external" onClick={()=>notify('Demande de retrait préparée. Contactez l’hébergeur de cette source.')}>Demander le retrait</Button></div></div>
        <div className="threat-resolution"><Badge status={item.status||'unread'} subtle/>{item.status!=='resolved'&&<Button icon="check" onClick={()=>void update(item,{status:'resolved'})}>Marquer résolu</Button>}</div>
        <div className="threat-menu"><IconButton name="more" label={`Options pour ${item.name}`} onClick={()=>openModal({kind:'detail',entity:item})}/></div>
      </article>):<EmptyState title="Aucune menace trouvée" message="Ajoutez une surveillance ou modifiez les filtres." icon="shield" action={<Button icon="plus" onClick={addThreat}>Ajouter une surveillance</Button>}/>}</div>
    </div><aside className="protection-aside"><Panel title="Actions rapides" icon="bolt" className="quick-action-panel"><Button icon="radar" onClick={()=>void analyze()}>Lancer un scan</Button><Button icon="alert" onClick={addThreat}>Signaler une usurpation</Button><Button icon="settings" onClick={()=>notify('Les alertes de protection sont configurables dans Paramètres.')}>Configurer les alertes</Button></Panel><Panel title="Statut de surveillance" icon="activity"><div className="protection-monitor"><div><strong>{Math.max(1,data.sources.filter(s=>s.active).length)}</strong><span>/ {data.sources.length || 12}</span></div><p><b>Surveillances actives</b><small>Tous les moniteurs sont opérationnels</small></p></div><Button className="protection-link" onClick={()=>openModal({kind:'detail',entity:data.sources[0]})}>Voir tous les moniteurs <Icon name="arrow" size={14}/></Button></Panel><Panel title="Évolution des menaces" icon="trend" action={<span className="mini-period">7 derniers jours⌄</span>} className="threat-chart"><LineChart values={[19,17,14,10,7,5,4]} labels={['18 mai','19 mai','20 mai','21 mai','22 mai','23 mai','24 mai']} max={20} color="#ff4855" tooltip={false}/></Panel><Panel title="Conseils de protection" icon="shield"><ul className="protection-tips"><li><Icon name="shield"/>Activez l’authentification à deux facteurs partout où c’est possible.</li><li><Icon name="lock"/>Surveillez régulièrement vos comptes et alertes.</li><li><Icon name="alert"/>Ne cliquez pas sur les liens suspects et signalez-les immédiatement.</li></ul><Button className="protection-link" onClick={()=>notify('Conseil : utilisez un gestionnaire de mots de passe et des mots de passe uniques.')}>Voir plus de conseils <Icon name="arrow" size={14}/></Button></Panel></aside></div>
    <footer className="protection-footer"><span><Icon name="shield"/>Surveillance d’identité active – Scans quotidiens</span><span><i className="dot green"/> Tous systèmes opérationnels</span></footer>
  </div></AppShell>;
}
