'use client';
import { useState } from 'react';
import { AppShell, PageHeading } from '@/components/app-shell';
import { useWorkspace } from '@/components/workspace-context';
import { Badge, Button, Icon, Panel } from '@/components/ui';

const plans = [
  { name:'Starter', price:'100 000', caption:'Pour les professionnels et les petites entreprises.', items:[['Veille','Suivi des mentions en ligne'],['Alertes','Notification dès qu’une mention compte'],['Tableau de bord','Vue d’ensemble de votre réputation'],['Rapports','Bilans périodiques exportables']] },
  { name:'Pro', price:'250 000', caption:'Pour les dirigeants et les personnalités.', items:[['Multi-sources de surveillance','Presse, réseaux sociaux, forums, blogs'],['Analyse IA','Détection du ton et des tendances'],['Scoring','Note de réputation suivie dans le temps']] },
  { name:'Premium', price:'500 000', caption:'Pour les grandes personnalités et les grandes entreprises.', items:[['War room','Cellule de gestion de crise en temps réel'],['Surveillance renforcée','Couverture étendue et suivi prioritaire'],['Accompagnement','Conseils d’un expert dédié'],['Intégration d’une équipe dédiée','Une équipe qui travaille avec la vôtre'],['Relations médias','Prise en charge de vos contacts presse']] },
];
export default function OffersPage() {
  const { data, save, notify } = useWorkspace();
  const [busy, setBusy] = useState('');
  const currentPlan = data.settings[0]?.category || 'Pro';
  async function choose(name: string) {
    if (name === currentPlan) return;
    setBusy(name);
    const result = await save('settings', { ...(data.settings[0] || {}), name: 'Préférences du compte', category: name, status: 'pending', description: `Demande de changement d’abonnement vers ${name}` }, data.settings[0]?.id);
    setBusy('');
    if (result) notify(`Votre demande pour le forfait ${name} a été enregistrée. Notre équipe vous contactera pour finaliser le changement.`);
  }
  return <AppShell section="parametres"><div className="section-page offers-page"><div className="breadcrumb"><button onClick={()=>window.location.assign('/parametres')}>Accueil</button><Icon name="right" size={13}/><button onClick={()=>window.location.assign('/parametres')}>Paramètres</button><Icon name="right" size={13}/><span>Changer de plan</span></div><PageHeading title="Changer de plan" subtitle="Choisissez le niveau de protection adapté à votre exposition. Chaque plan inclut celui du dessous."/><Panel className="current-plan-strip"><Icon name="star"/><span>Plan actuel</span><Badge status="active" subtle>{currentPlan}</Badge><i/><strong>{plans.find(p=>p.name===currentPlan)?.price || '250 000'} FCFA <small>/ mois</small></strong><i/><span>Prochaine facturation le 24 novembre 2026</span></Panel><div className="offers-grid">{plans.map((plan,i)=>{const current=plan.name===currentPlan;return <article key={plan.name} className={`offer-card ${current?'current':''} ${i===2?'premium':''}`}><div className="offer-title"><h2>{plan.name}</h2>{current&&<Badge status="active" subtle>Plan actuel</Badge>}</div><p>{plan.caption}</p><div className="offer-price"><strong>{plan.price}</strong><span>FCFA / mois</span></div><Button className="offer-select" variant={current?'outline':'outline'} disabled={current} busy={busy===plan.name} onClick={()=>void choose(plan.name)}>{current?'Plan actuel':`Choisir ${plan.name}`}</Button><div className="offer-includes"><span>{i===0?'Inclus dans le plan :':i===1?'Tout le plan Starter, et en plus :':'Tout le plan Pro, et en plus :'}</span>{plan.items.map(([title,description])=><div key={title}><Icon name="check"/><span><strong>{title}</strong><small>{description}</small></span></div>)}</div></article>})}</div><Panel title="Comparer les fonctionnalités" icon="bars" className="offer-comparison"><p>Ce qui est inclus dans chaque plan, ligne par ligne.</p><div className="comparison-row comparison-head"><strong>Fonctionnalité</strong>{plans.map(p=><strong key={p.name}>{p.name}</strong>)}</div>{['Veille multi-sources','Alertes personnalisées','Analyse IA et scoring','Gestion de crise War room','Surveillance renforcée','Accompagnement dédié'].map((feature,index)=><div className="comparison-row" key={feature}><span>{feature}</span>{plans.map((p,i)=><span key={p.name}>{i>=Math.max(0,index-2)?<Icon name="check" className="text-green"/>:'—'}</span>)}</div>)}</Panel><p className="offer-note">Les changements d’abonnement sont enregistrés comme une demande. La facturation sera confirmée par notre équipe.</p></div></AppShell>;
}
