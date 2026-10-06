'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProjectsContract } from '@/lib/web3';
import { Leaf, MapPin, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function ProjectsDirectory() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const contract = getProjectsContract();
        const data = await contract.listProjects(0, 100);
        
        const formatted = data.map((p: any) => ({
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
        }));
        
        setProjects(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const StatusBadge = ({ status }: { status: number }) => {
    if (status === 1) return <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
    if (status === 0) return <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Clock className="w-3 h-3" /> Pending</span>;
    return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle className="w-3 h-3" /> Rejected</span>;
  }

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Discover Projects</h1>
        <p className="text-white/60 text-lg font-light">Explore verified tree-planting initiatives from our trusted NGO partners around the world.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 && (
            <div className="col-span-full text-center text-white/40 py-20">No projects found.</div>
          )}
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="group flex flex-col bg-[#0b1515] border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-b from-emerald-900/20 to-black/40 flex items-center justify-center border-b border-white/10 relative overflow-hidden">
                <Leaf className="w-16 h-16 text-emerald-500/20 group-hover:text-emerald-500/40 group-hover:scale-110 transition-all duration-500" />
                <div className="absolute top-4 right-4">
                  <StatusBadge status={project.status} />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{project.name}</h3>
                <div className="flex items-center gap-2 text-sm text-white/50 mb-6 font-light">
                  <MapPin className="w-4 h-4" /> {project.location}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-white/10">
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Trees Planted</div>
                    <div className="font-semibold text-lg">{Number(project.treesPlanted).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Verified Tonnes</div>
                    <div className="font-semibold text-lg text-emerald-400">{project.verifiedTonnes} tCO2e</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
