'use client';
import { useState, useEffect } from 'react';
import { getProjectsWithSigner, getProjectsContract, getSigner } from '@/lib/web3';
import { Building2, Award, ArrowRight, Flame, Leaf } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CompanyDashboard() {
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [retirements, setRetirements] = useState<any[]>([]);
  
  const [retireData, setRetireData] = useState<{ [id: string]: { amount: string, name: string } }>({});
  const [retireLoading, setRetireLoading] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const signer = await getSigner();
        const address = await signer.getAddress();
        const projectsContract = await getProjectsContract();
        const contractWithSigner = await getProjectsWithSigner();
        
        // Fetch all projects to check balances
        const allProjects = await projectsContract.listProjects(0, 100);
        const myHoldings: any[] = [];
        
        for (const p of allProjects) {
          if (p.status === BigInt(1)) { // Approved
            const bal = await contractWithSigner.balanceOf(address, p.id);
            if (bal > BigInt(0)) {
              myHoldings.push({
                id: p.id.toString(),
                name: p.name,
                balance: bal.toString()
              });
            }
          }
        }
        setHoldings(myHoldings);

        // Fetch past retirements
        const retirementIds = await projectsContract.retirementsOf(address);
        const myRetirements = await Promise.all(
          retirementIds.map((id: any) => projectsContract.getRetirement(id))
        );
        
        setRetirements(myRetirements.map((r: any) => ({
          id: r.id.toString(),
          projectId: r.projectId.toString(),
          amount: r.amount.toString(),
          companyName: r.companyName,
          timestamp: new Date(Number(r.timestamp) * 1000).toLocaleDateString()
        })));
        
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleRetire = async (projectId: string) => {
    const data = retireData[projectId];
    if (!data || !data.amount || !data.name) return toast.error("Please enter amount and company name");
    
    try {
      setRetireLoading(projectId);
      const contract = await getProjectsWithSigner();
      const tx = await contract.retire(projectId, data.amount, data.name);
      await tx.wait();
      toast.success("Credits retired successfully! A certificate has been generated.");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error(e);
      toast.error(e.reason || e.message || "Failed to retire");
    } finally {
      setRetireLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20 flex-1"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-6xl">
      <div className="mb-12 border-b border-white/10 pb-6 flex items-center gap-4">
        <Building2 className="w-10 h-10 text-emerald-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">Manage your carbon credit portfolio and view offset certificates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Holdings Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4"><Leaf className="w-5 h-5 text-emerald-400"/> My Active Credits</h2>
          
          {holdings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/40">
              <p className="mb-4">You don't hold any active carbon credits.</p>
              <Link href="/market" className="text-emerald-400 hover:underline">Browse Market &rarr;</Link>
            </div>
          ) : holdings.map(h => (
            <div key={h.id} className="bg-[#0b1515] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">{h.name}</h3>
                  <Link href={`/projects/${h.id}`} className="text-xs text-emerald-400 hover:underline">View Project</Link>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded text-lg">
                  {h.balance} tCO2e
                </div>
              </div>
              
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2 font-semibold flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400"/> Retire Credits</p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" max={h.balance} placeholder="Amount to retire" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" onChange={e => setRetireData({...retireData, [h.id]: {...retireData[h.id], amount: e.target.value}})} />
                  <input type="text" placeholder="Company Name for Cert." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" onChange={e => setRetireData({...retireData, [h.id]: {...retireData[h.id], name: e.target.value}})} />
                </div>
                <button onClick={() => handleRetire(h.id)} disabled={retireLoading === h.id} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors mt-2 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                  {retireLoading === h.id ? 'Retiring & Burning...' : 'Permanently Retire Credits'}
                </button>
                <p className="text-[10px] text-white/40 text-center">Retiring will permanently burn these tokens and generate a certificate.</p>
              </div>
            </div>
          ))}
        </div>

        {/* Certificates Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4"><Award className="w-5 h-5 text-cyan-400"/> My Certificates</h2>
          
          {retirements.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/40">
              <p>You have not retired any credits yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {retirements.map(r => (
                <div key={r.id} className="bg-gradient-to-r from-[#0b1515] to-cyan-900/10 border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between group hover:border-cyan-500/50 transition-colors">
                  <div>
                    <div className="text-xs text-white/40 mb-1">{r.timestamp}</div>
                    <h3 className="font-bold text-lg mb-1">{r.amount} tCO2e Offset</h3>
                    <p className="text-sm text-white/60">by <span className="font-semibold text-white">{r.companyName}</span></p>
                  </div>
                  <Link href={`/certificate/${r.id}`} className="bg-white/5 group-hover:bg-cyan-500/20 p-3 rounded-full transition-colors">
                    <ArrowRight className="w-5 h-5 text-cyan-400" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
