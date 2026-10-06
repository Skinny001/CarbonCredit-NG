'use client';
import { useState, useEffect } from 'react';
import { getProjectsWithSigner, getSigner } from '@/lib/web3';
import { ShieldAlert, UserPlus, UserMinus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const signer = await getSigner();
        const userAddress = await signer.getAddress();
        const projectsContract = await getProjectsWithSigner();
        
        // ADMIN_ROLE is 0x000...
        const adminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
        const hasRole = await projectsContract.hasRole(adminRole, userAddress);
        setIsAdmin(hasRole);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, []);

  const handleAction = async (action: 'addNGO' | 'removeNGO' | 'addVerifier' | 'removeVerifier') => {
    if (!address) return toast.error("Please enter an address");
    try {
      setActionLoading(true);
      const contract = await getProjectsWithSigner();
      const tx = await contract[action](address);
      await tx.wait();
      toast.success(`Action ${action} successful!`);
      setAddress('');
    } catch (e: any) {
      console.error(e);
      toast.error(e.reason || e.message || "Transaction failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 flex-1"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  if (!isAdmin) return (
    <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-white/60 max-w-md">You do not have the Admin role required to view this page. Only the contract deployer can manage roles.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-3xl">
       <div className="mb-12 flex items-center gap-4 border-b border-white/10 pb-6">
         <ShieldCheck className="w-10 h-10 text-emerald-400" />
         <div>
           <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
           <p className="text-white/50 text-sm mt-1">Manage platform roles and permissions</p>
         </div>
       </div>
       
       <div className="bg-[#0b1515] border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
         <h2 className="text-xl font-bold mb-6">Role Management</h2>
         
         <div className="space-y-6">
           <div>
             <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Target Ethereum Address</label>
             <input 
               type="text" 
               value={address}
               onChange={e => setAddress(e.target.value)}
               placeholder="0x..."
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
             />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
             <button onClick={() => handleAction('addNGO')} disabled={actionLoading} className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl py-3 font-semibold transition-colors disabled:opacity-50">
               <UserPlus className="w-4 h-4" /> Grant NGO Role
             </button>
             <button onClick={() => handleAction('removeNGO')} disabled={actionLoading} className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl py-3 font-semibold transition-colors disabled:opacity-50">
               <UserMinus className="w-4 h-4" /> Revoke NGO Role
             </button>
             <button onClick={() => handleAction('addVerifier')} disabled={actionLoading} className="flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl py-3 font-semibold transition-colors disabled:opacity-50">
               <UserPlus className="w-4 h-4" /> Grant Verifier Role
             </button>
             <button onClick={() => handleAction('removeVerifier')} disabled={actionLoading} className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl py-3 font-semibold transition-colors disabled:opacity-50">
               <UserMinus className="w-4 h-4" /> Revoke Verifier Role
             </button>
           </div>
         </div>
       </div>
    </div>
  )
}
