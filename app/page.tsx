'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, ShieldCheck, TreePine, ArrowRight, BarChart } from 'lucide-react';
import { getProjectsContract, getMarketContract } from '@/lib/web3';

export default function Home() {
  const [stats, setStats] = useState({
    issued: '0',
    retired: '0',
    projects: '0',
    activeListings: '0'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const projectsContract = getProjectsContract();
        const marketContract = getMarketContract();
        
        // Parallel fetching
        const [totals, nextProjectId, activeListingsData] = await Promise.all([
          projectsContract.totals(),
          projectsContract.nextProjectId(),
          marketContract.listActive(0, 100) 
        ]);

        setStats({
          issued: totals.issued.toString(),
          retired: totals.retired.toString(),
          projects: (Number(nextProjectId) - 1).toString(),
          activeListings: activeListingsData.length.toString()
        });
      } catch (e) {
        console.error("Failed to fetch stats", e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 flex-1 flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,rgba(11,21,21,1)_70%)] pointer-events-none" />
        
        <div className="z-10 text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live on BOT Chain Testnet
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Tokenized <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Tree Planting.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            NGOs plant trees, verifiers confirm, and carbon credit tokens are minted. 
            Companies can buy and retire credits transparently on-chain.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/market" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Explore Market <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/projects" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-full font-medium transition-all">
              View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              icon={<TreePine className="w-6 h-6 text-emerald-400" />}
              title="Tonnes Issued" 
              value={loading ? '...' : stats.issued} 
            />
            <StatCard 
              icon={<ShieldCheck className="w-6 h-6 text-cyan-400" />}
              title="Tonnes Retired" 
              value={loading ? '...' : stats.retired} 
            />
            <StatCard 
              icon={<Leaf className="w-6 h-6 text-green-400" />}
              title="Total Projects" 
              value={loading ? '...' : stats.projects} 
            />
            <StatCard 
              icon={<BarChart className="w-6 h-6 text-blue-400" />}
              title="Active Listings" 
              value={loading ? '...' : stats.activeListings} 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-[#0b1515] border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500/30 transition-colors group shadow-lg">
      <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-4xl font-bold text-white mb-2">{value}</div>
        <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{title}</div>
      </div>
    </div>
  );
}
