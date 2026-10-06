'use client'

import { useState } from 'react'
import { navItems, projects, type Project } from './carbon-data'

type Notice = (message: string) => void

export function DashboardShell() {
  const [active, setActive] = useState('Overview')
  const [connected, setConnected] = useState(false)
  const [notice, setNotice] = useState('')
  const navigate = (item: string) => { setActive(item); setNotice('') }
  const notify = (message: string) => setNotice(message)

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span><span>CarbonCredit<span className="brand-accent">NG</span></span></div>
        <div className="network-pill"><span className="pulse" /> BOT Chain Testnet <span className="chain-id">968</span></div>
        <nav className="side-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item, index) => <button key={item} className={`nav-item ${active === item ? 'active' : ''}`} onClick={() => navigate(item)}><span className="nav-icon">{['⌂', '◈', '↗', '□', '＋', '✓', '▣'][index]}</span>{item}{item === 'Marketplace' && <span className="nav-count">12</span>}{item === 'Verifier Queue' && <span className="nav-count warning">4</span>}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><span className="help-icon">?</span><div><strong>Need help?</strong><small>Read the platform guide</small></div><span>→</span></div><button className="profile"><span className="avatar">AC</span><span><strong>Acme Carbon</strong><small>Company account</small></span><span className="dots">•••</span></button></div>
      </aside>
      <section className="content-area">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications">♧<i /></button><button className="wallet-button" onClick={() => { setConnected(true); notify('Wallet connected in demo mode. Add contract addresses to enable live reads.') }}>{connected ? '0x71...A92C' : 'Connect wallet'}<span className="wallet-dot" /></button></div></header>
        <div className="page-content">
          {active === 'Overview' ? <Overview onOpen={navigate} onNotice={notify} /> : <WorkspaceScreen active={active} onNavigate={navigate} onNotice={notify} />}
          {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}
        </div>
      </section>
    </main>
  )
}

function Overview({ onOpen, onNotice }: { onOpen: (item: string) => void; onNotice: Notice }) {
  return <>
    <div className="hero-row"><div><p className="eyebrow">CARBON CREDIT NETWORK <span className="live-dot" /> LIVE ON TESTNET</p><h1>Make impact.<br /><em>Prove it on-chain.</em></h1><p className="hero-copy">A transparent marketplace for verified carbon removal.<br />Fund restoration projects and retire credits with confidence.</p></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="leaf">⌁</div><span className="art-label">VERIFIED<br />IMPACT</span></div></div>
    <div className="stats-grid"><Stat label="Tonnes issued" value="19,110" change="+8.4%" /><Stat label="Tonnes retired" value="4,280" change="+12.6%" /><Stat label="Active projects" value="28" change="+3 this month" /><Stat label="Market volume" value="$184.6k" change="+21.2%" /></div>
    <div className="section-heading"><div><p className="eyebrow">CURATED PROJECTS</p><h2>Verified impact on the ground</h2></div><button className="text-button" onClick={() => onOpen('Projects')}>View all projects <span>→</span></button></div>
    <div className="project-grid">{projects.map(project => <ProjectCard key={project.id} project={project} onBuy={() => { onOpen('Marketplace'); onNotice(`${project.name} selected. Choose a credit amount to continue.`) }} />)}</div>
    <div className="bottom-grid"><div className="activity-card"><div className="card-heading"><div><p className="eyebrow">NETWORK ACTIVITY</p><h3>Recent retirements</h3></div><span className="verified-chip">● On-chain</span></div>{['Moss Earth Ltd.','TerraNova Foods','Northstar Energy'].map((company, i) => <div className="activity-row" key={company}><span className="activity-avatar">{['ME','TF','NE'][i]}</span><span><strong>{company}</strong><small>Retired {['320','180','75'][i]} tonnes · {['2m','18m','1h'][i]} ago</small></span><strong className="activity-amount">-{['320','180','75'][i]} t</strong></div>)}</div><div className="impact-card"><p className="eyebrow">YOUR IMPACT</p><h3>320 tCO₂e</h3><p>retired by your organization</p><button className="outline-cta" onClick={() => onOpen('Certificates')}>View certificates <span>→</span></button></div></div>
  </>
}

function WorkspaceScreen({ active, onNavigate, onNotice }: { active: string; onNavigate: (item: string) => void; onNotice: Notice }) {
  const titles: Record<string, string> = { Projects: 'Project registry', Marketplace: 'Carbon marketplace', Retirements: 'Retirement certificates', 'NGO Portal': 'NGO project portal', 'Verifier Queue': 'Verification queue', Certificates: 'Certificate archive' }
  const descriptions: Record<string, string> = { Projects: 'Browse every registered restoration project and its evidence.', Marketplace: 'Purchase verified tonnes from active Nigerian climate projects.', Retirements: 'Create and share permanent proof of your climate contribution.', 'NGO Portal': 'Submit a new project and track its verification journey.', 'Verifier Queue': 'Review evidence packages awaiting independent verification.', Certificates: 'Search and download certificates issued by the network.' }
  const isMarketplace = active === 'Marketplace'
  const isPortal = active === 'NGO Portal'
  const action = isMarketplace ? 'Browse credits' : isPortal ? 'Create new project' : active === 'Projects' ? 'Register project' : active === 'Retirements' ? 'Create retirement' : 'Create new'
  return <section className="workspace-screen"><div className="screen-header"><div><p className="eyebrow">WORKSPACE MODULE</p><h1>{titles[active]}</h1><p>{descriptions[active]}</p></div><button className="primary-cta" onClick={() => { if (isMarketplace) onNavigate('Projects'); else if (isPortal) onNotice('Project registration form opened. Add wallet and evidence details to continue.'); else if (active === 'Projects') onNotice('Project registration is ready for your NGO profile.'); else onNotice(`${action} is ready for contract integration.`) }}>{action} <span>↗</span></button></div><div className="screen-grid"><div className="screen-panel"><span className="panel-kicker">LIVE REGISTRY</span><strong>{active === 'Verifier Queue' ? '4' : active === 'Certificates' ? '126' : active === 'Retirements' ? '42' : '28'}</strong><p>{active === 'Verifier Queue' ? 'reviews waiting' : active === 'Certificates' ? 'certificates issued' : 'records available on-chain'}</p></div><div className="screen-panel"><span className="panel-kicker">STATUS</span><strong className="status-live">Operational</strong><p>BOT Chain testnet connected</p></div><div className="screen-panel"><span className="panel-kicker">NEXT STEP</span><strong>{active === 'Verifier Queue' ? 'Review evidence' : isMarketplace ? 'Select credits' : isPortal ? 'Register project' : 'Explore records'}</strong><p>Continue from this workspace</p></div></div>{isMarketplace ? <MarketplaceContent onBuy={(name) => onNotice(`${name} added to your order. Connect wallet to continue.`)} /> : isPortal ? <PortalContent onNotice={onNotice} /> : <RegistryContent active={active} onNotice={onNotice} />}</section>
}

function MarketplaceContent({ onBuy }: { onBuy: (name: string) => void }) { return <div className="workspace-list"><div className="section-heading"><div><p className="eyebrow">AVAILABLE NOW</p><h2>Verified credits</h2></div><span className="verified-chip">12 listings</span></div><div className="project-grid">{projects.map(project => <ProjectCard key={project.id} project={project} onBuy={() => onBuy(project.name)} />)}</div></div> }
function PortalContent({ onNotice }: { onNotice: Notice }) { return <div className="workspace-list"><div className="section-heading"><div><p className="eyebrow">PROJECT WORKFLOW</p><h2>Bring a project on-chain</h2></div></div><div className="workflow-grid">{['Project details','Evidence package','Community outcomes'].map((step, i) => <button className="workflow-step" key={step} onClick={() => onNotice(`${step} step selected. Complete the previous step to continue.`)}><span>0{i + 1}</span><strong>{step}</strong><small>{['Name, location, methodology','IPFS documents and monitoring','Jobs, livelihoods, restoration'][i]}</small><b>→</b></button>)}</div></div> }
function RegistryContent({ active, onNotice }: { active: string; onNotice: Notice }) { const rows = active === 'Verifier Queue' ? ['Ogun Forest Corridor','Cross River Restoration','Kwara Agroforestry','Niger Delta Wetlands'] : active === 'Certificates' ? ['CCNG-CERT-0042','CCNG-CERT-0039','CCNG-CERT-0031','CCNG-CERT-0028'] : active === 'Retirements' ? ['Moss Earth Ltd. · 320 tonnes','TerraNova Foods · 180 tonnes','Northstar Energy · 75 tonnes'] : projects.map(project => project.name); return <div className="registry-list"><div className="section-heading"><div><p className="eyebrow">ON-CHAIN RECORDS</p><h2>{active === 'Verifier Queue' ? 'Pending reviews' : active === 'Certificates' ? 'Issued certificates' : active === 'Retirements' ? 'Recent retirements' : 'Registered projects'}</h2></div></div>{rows.map((row, i) => <button className="registry-row" key={row} onClick={() => onNotice(`${row} selected. Detailed contract data will appear after deployment.`)}><span className="activity-avatar">{String(i + 1).padStart(2, '0')}</span><span><strong>{row}</strong><small>{active === 'Verifier Queue' ? 'Evidence package awaiting review' : active === 'Certificates' ? 'Retirement certificate · IPFS anchored' : 'BOT Chain testnet record'}</small></span><b>↗</b></button>)}</div> }
function Stat({ label, value, change }: { label: string; value: string; change: string }) { return <div className="stat-card"><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-change">↑ {change}</span><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /></div></div> }
function ProjectCard({ project, onBuy }: { project: Project; onBuy: () => void }) { return <article className="project-card"><div className={`project-image ${project.accent}`}><span className="project-tag">{project.status} <b>✓</b></span><span className="project-id">{project.id}</span><div className="landscape"><span>⌁</span><span>⌁</span><span>⌁</span></div></div><div className="project-body"><div className="project-title"><div><h3>{project.name}</h3><p>⌖ {project.location}</p></div><span className="arrow">↗</span></div><div className="project-metrics"><div><small>TREES PLANTED</small><strong>{project.trees}</strong></div><div><small>VERIFIED TONNES</small><strong>{project.tonnes} <small>tCO₂e</small></strong></div></div><div className="project-footer"><span>From <strong>{project.price} USDT</strong> / tonne</span><button onClick={onBuy}>View project <span>→</span></button></div></div></article> }

export default DashboardShell
