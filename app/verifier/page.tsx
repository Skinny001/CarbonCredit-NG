'use client';
import { useState, useEffect } from 'react';
import { getProjectsWithSigner, getProjectsContract, getSigner } from '@/lib/web3';
import { ShieldCheck, Check, X, FileCheck } from 'lucide-react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function VerifierDashboard() {
  const [isVerifier, setIsVerifier] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  
  const [actionData, setActionData] = useState<{ [id: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const signer = await getSigner();
        const address = await signer.getAddress();
        const projectsContract = await getProjectsContract();
        
        // Check Verifier Role
        const verifierRole = ethers.id("VERIFIER_ROLE");
        const hasRole = await projectsContract.hasRole(verifierRole, address);
        setIsVerifier(hasRole);

        if (hasRole) {
          const allProjects = await projectsContract.listProjects(0, 100);
          const pending = allProjects.filter((p: any) => Number(p.status) === 0);
          
          setPendingProjects(pending.map((p: any) => ({
            id: p.id.toString(),
            ngo: p.ngo,
            name: p.name,
            location: p.location,
            treesPlanted: p.treesPlanted.toString(),
            evidenceCid: p.evidenceCid,
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

  const handleApprove = async (id: string) => {
    const tonnes = actionData[id];
    if (!tonnes || Number(tonnes) <= 0) return toast.error("Please enter valid verified tonnes");
    
    try {
      setActionLoading(id);
      const contract = await getProjectsWithSigner();
      const tx = await contract.approveProject(id, tonnes);
      await tx.wait();
      toast.success("Project approved successfully!");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error(e);
      toast.error(e.reason || e.message || "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = actionData[id];
    if (!reason) return toast.error("Please enter a rejection reason");
    
    try {
      setActionLoading(id);
      const contract = await getProjectsWithSigner();
      const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reason));
      const tx = await contract.rejectProject(id, reasonHash);
      await tx.wait();
      toast.success("Project rejected");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error(e);
      toast.error(e.reason || e.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20 flex-1"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  if (!isVerifier) return (
    <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center">
      <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-white/60">You do not have the Verifier role required to view this queue.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-5xl">
      <div className="mb-12 border-b border-white/10 pb-6 flex items-center gap-4">
        <FileCheck className="w-10 h-10 text-emerald-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verifier Queue</h1>
          <p className="text-white/50 text-sm mt-1">Review evidence and approve or reject pending projects</p>
        </div>
      </div>

      <div className="space-y-6">
        {pendingProjects.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/40">No pending projects to review.</p>
          </div>
        ) : pendingProjects.map(p => (
          <div key={p.id} className="bg-[#0b1515] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{p.name}</h3>
                <p className="text-xs font-mono text-white/40">NGO: {p.ngo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-black/40 p-4 rounded-xl border border-white/5">
                <div><span className="block text-xs uppercase text-white/40 mb-1">Location</span>{p.location}</div>
                <div><span className="block text-xs uppercase text-white/40 mb-1">Reported Trees</span>{p.treesPlanted}</div>
                <div className="col-span-2">
                  <span className="block text-xs uppercase text-white/40 mb-1">Evidence</span>
                  <a href={`https://gateway.pinata.cloud/ipfs/${p.evidenceCid}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-1">
                    View IPFS Data ({p.evidenceCid.substring(0,8)}...)
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 w-full lg:w-80 flex flex-col justify-center">
              <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Decision Input</label>
              <input 
                type="text" 
                placeholder="Tonnes (if approving) OR Reason (if rejecting)" 
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 mb-4" 
                onChange={e => setActionData({...actionData, [p.id]: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleApprove(p.id)} 
                  disabled={actionLoading === p.id} 
                  className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  <Check className="w-4 h-4"/> Approve
                </button>
                <button 
                  onClick={() => handleReject(p.id)} 
                  disabled={actionLoading === p.id} 
                  className="flex items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-50 font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  <X className="w-4 h-4"/> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
