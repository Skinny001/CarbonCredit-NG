'use client';
import { useEffect, useState, use } from 'react';
import { getProjectsContract, getMarketContract } from '@/lib/web3';
import { MapPin, Calendar, Link as LinkIcon, FileCheck, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [project, setProject] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const projectsContract = getProjectsContract();
        const marketContract = getMarketContract();
        
        const p = await projectsContract.getProject(id);
        
        if (p.id.toString() !== '0') {
          setProject({
            id: p.id.toString(),
            ngo: p.ngo,
            name: p.name,
            location: p.location,
            treesPlanted: p.treesPlanted.toString(),
            plantedAt: new Date(Number(p.plantedAt) * 1000).toLocaleDateString(),
            evidenceCid: p.evidenceCid,
            verifiedTonnes: p.verifiedTonnes.toString(),
            status: Number(p.status),
            retired: p.retired.toString()
          });

          // Fetch active listings for this project
          const activeListingsData = await marketContract.listActive(0, 100);
          const projectListings = activeListingsData.filter((l: any) => l.projectId.toString() === id);
          
          setListings(projectListings.map((l: any) => ({
            id: l.id.toString(),
            seller: l.seller,
            amount: l.amount.toString(),
            pricePerTonne: (Number(l.pricePerTonne) / 1e18).toFixed(2), // assuming 18 decimals for USDT
            active: l.active
          })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20 flex-1"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  if (!project) return <div className="text-center py-20 flex-1 text-white/50">Project not found</div>;

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <Link href="/projects" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors mb-8 inline-block font-medium">&larr; Back to Projects</Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/60 font-light">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {project.location}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Planted {project.plantedAt}</span>
              <span className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-emerald-500" /> NGO: <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">{project.ngo.substring(0,8)}...</span></span>
            </div>
          </div>
          
          <div className="bg-[#0b1515] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Project Evidence</h2>
            {project.evidenceCid ? (
              <a href={`https://gateway.pinata.cloud/ipfs/${project.evidenceCid}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-4 py-3 rounded-xl transition-colors">
                <LinkIcon className="w-4 h-4" /> View IPFS Evidence (CID: {project.evidenceCid.substring(0,8)}...)
              </a>
            ) : (
              <p className="text-white/40 font-light">No evidence attached to this project.</p>
            )}
          </div>

          <div className="bg-[#0b1515] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
             <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Active Market Listings</h2>
             {listings.length === 0 ? (
               <p className="text-white/40 font-light">No active listings for this project yet.</p>
             ) : (
               <div className="space-y-4">
                 {listings.map(listing => (
                   <div key={listing.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/5">
                     <div>
                       <div className="font-bold text-lg text-emerald-400">{listing.amount} tCO2e available</div>
                       <div className="text-sm text-white/50 font-mono mt-1">Seller: {listing.seller.substring(0,6)}...{listing.seller.substring(38)}</div>
                     </div>
                     <div className="text-left md:text-right">
                       <div className="font-bold text-xl">{listing.pricePerTonne} <span className="text-sm text-white/50 font-normal">USDT / tonne</span></div>
                       <Link href="/market" className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full mt-2 inline-block transition-colors uppercase tracking-wider">Go to Market</Link>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 rounded-2xl p-8 shadow-2xl sticky top-24">
            <h3 className="text-xs uppercase tracking-widest font-bold text-emerald-400 mb-8 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Carbon Stats
            </h3>
            <div className="space-y-8">
              <div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Status</div>
                <div className="font-semibold text-lg">{project.status === 1 ? 'Approved' : project.status === 0 ? 'Pending' : 'Rejected'}</div>
              </div>
              <div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Total Verified Tonnes</div>
                <div className="text-4xl font-bold text-white">{project.verifiedTonnes}</div>
              </div>
              <div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Tonnes Retired</div>
                <div className="text-2xl font-semibold text-white/80">{project.retired}</div>
              </div>
              <div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Trees Planted</div>
                <div className="text-2xl font-semibold text-white/80">{Number(project.treesPlanted).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
