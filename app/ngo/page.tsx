'use client';
import { useState, useEffect } from 'react';
import { getProjectsWithSigner, getProjectsContract, getMarketWithSigner, getSigner, MARKET_ADDRESS } from '@/lib/web3';
import { Leaf, PlusCircle, LayoutDashboard, Tag } from 'lucide-react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function NGODashboard() {
  const [isNGO, setIsNGO] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'submit' | 'manage'>('manage');
  
  // Submit Form State
  const [formData, setFormData] = useState({ name: '', location: '', trees: '', date: '', cid: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Listing State
  const [listingData, setListingData] = useState<{ [id: string]: { amount: string, price: string } }>({});
  const [listingLoading, setListingLoading] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const signer = await getSigner();
        const address = await signer.getAddress();
        const projectsContract = await getProjectsContract();
        
        // Check NGO Role
        const ngoRole = ethers.id("NGO_ROLE");
        const hasRole = await projectsContract.hasRole(ngoRole, address);
        setIsNGO(hasRole);

        if (hasRole) {
          // Fetch NGO's projects
          const projectIds = await projectsContract.projectsOf(address);
          const projectDetails = await Promise.all(
            projectIds.map((id: any) => projectsContract.getProject(id))
          );
          
          setProjects(projectDetails.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            location: p.location,
            treesPlanted: p.treesPlanted.toString(),
            verifiedTonnes: p.verifiedTonnes.toString(),
            status: Number(p.status),
            balance: "0" // will fetch balance below
          })));

          // Fetch token balances for approved projects
          const contractWithSigner = await getProjectsWithSigner();
          const balances = await Promise.all(
            projectDetails.map((p: any) => contractWithSigner.balanceOf(address, p.id))
          );
          
          setProjects(prev => prev.map((p, i) => ({
            ...p,
            balance: balances[i].toString()
          })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const contract = await getProjectsWithSigner();
      
      const plantedAt = Math.floor(new Date(formData.date).getTime() / 1000);
      const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes(formData.cid || "mock-evidence"));

      const tx = await contract.submitProject(
        formData.name,
        formData.location,
        Number(formData.trees),
        plantedAt,
        formData.cid || "mock-cid",
        evidenceHash
      );
      
      await tx.wait();
      toast.success("Project submitted successfully!");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error(e);
      toast.error(e.reason || e.message || "Failed to submit project");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateListing = async (projectId: string) => {
    const data = listingData[projectId];
    if (!data || !data.amount || !data.price) return toast.error("Please enter amount and price");
    
    try {
      setListingLoading(projectId);
      const projectsContract = await getProjectsWithSigner();
      const marketContract = await getMarketWithSigner();
      
      // Check approval
      const isApproved = await projectsContract.isApprovedForAll(await projectsContract.getAddress(), MARKET_ADDRESS);
      if (!isApproved) {
        console.log("Setting approval for market...");
        const approveTx = await projectsContract.setApprovalForAll(MARKET_ADDRESS, true);
        await approveTx.wait();
      }

      console.log("Creating listing...");
      const priceInWei = ethers.parseUnits(data.price, 18);
      const tx = await marketContract.createListing(projectId, data.amount, priceInWei);
      await tx.wait();
      
      toast.success("Listing created successfully!");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error(e);
      toast.error(e.reason || e.message || "Failed to create listing");
    } finally {
      setListingLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20 flex-1"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  if (!isNGO) return (
    <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <Leaf className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-white/60">You do not have the NGO role. Contact the administrator.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-5xl">
      <div className="mb-12 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">NGO Hub</h1>
        <p className="text-white/50 text-sm">Manage your tree-planting projects and market listings</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('manage')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'manage' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          <LayoutDashboard className="w-4 h-4 inline mr-2" /> My Projects
        </button>
        <button 
          onClick={() => setActiveTab('submit')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'submit' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          <PlusCircle className="w-4 h-4 inline mr-2" /> Submit New Project
        </button>
      </div>

      {activeTab === 'submit' && (
        <div className="bg-[#0b1515] border border-white/10 rounded-2xl p-8 shadow-xl max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Project Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Location</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Trees Planted</label>
                <input required type="number" value={formData.trees} onChange={e => setFormData({...formData, trees: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Planting Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Evidence CID (IPFS)</label>
                <input required type="text" placeholder="Qm..." value={formData.cid} onChange={e => setFormData({...formData, cid: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <button type="submit" disabled={submitLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg mt-4">
              {submitLoading ? 'Submitting...' : 'Submit Project for Verification'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          {projects.length === 0 ? (
            <p className="text-white/40">You have not submitted any projects yet.</p>
          ) : projects.map(p => (
            <div key={p.id} className="bg-[#0b1515] border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold">{p.name}</h3>
                  {p.status === 0 && <span className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>}
                  {p.status === 1 && <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs font-bold uppercase">Approved</span>}
                  {p.status === 2 && <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs font-bold uppercase">Rejected</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/60">
                  <div><span className="block text-xs uppercase text-white/40 mb-1">Location</span>{p.location}</div>
                  <div><span className="block text-xs uppercase text-white/40 mb-1">Trees</span>{p.treesPlanted}</div>
                  <div><span className="block text-xs uppercase text-white/40 mb-1">Verified Tonnes</span>{p.status === 1 ? p.verifiedTonnes : '-'}</div>
                  <div><span className="block text-xs uppercase text-white/40 mb-1">Unlisted Credits</span>{p.balance} tCO2e</div>
                </div>
              </div>
              
              {p.status === 1 && Number(p.balance) > 0 && (
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 min-w-[300px]">
                  <h4 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2"><Tag className="w-4 h-4"/> Create Listing</h4>
                  <div className="space-y-3">
                    <input type="number" max={p.balance} placeholder="Amount to list" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" onChange={e => setListingData({...listingData, [p.id]: {...listingData[p.id], amount: e.target.value}})} />
                    <input type="number" placeholder="Price per tonne (USDT)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" onChange={e => setListingData({...listingData, [p.id]: {...listingData[p.id], price: e.target.value}})} />
                    <button onClick={() => handleCreateListing(p.id)} disabled={listingLoading === p.id} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                      {listingLoading === p.id ? 'Creating...' : 'List on Market'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
