'use client';
import { useEffect, useState, use } from 'react';
import { getProjectsContract } from '@/lib/web3';
import { Award, CheckCircle, ExternalLink, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function Certificate({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const contract = getProjectsContract();
        const r = await contract.getRetirement(id);
        
        if (r.id.toString() !== '0') {
          const p = await contract.getProject(r.projectId);
          
          setCert({
            id: r.id.toString(),
            companyName: r.companyName,
            amount: r.amount.toString(),
            timestamp: new Date(Number(r.timestamp) * 1000).toLocaleDateString(),
            projectName: p.name,
            projectId: p.id.toString(),
            wallet: r.company
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center py-32 flex-1"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  if (!cert) return <div className="text-center py-32 flex-1 text-white/50">Certificate not found.</div>;

  return (
    <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center">
      <Link href="/company" className="text-sm text-emerald-400 hover:underline mb-8 self-start md:self-auto">&larr; Back to Dashboard</Link>
      
      <div className="w-full max-w-3xl relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-cyan-500/5 to-transparent blur-3xl -z-10"></div>
        
        <div className="bg-[#0b1515] border-2 border-emerald-500/30 rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden">
          {/* Watermark */}
          <Award className="absolute -bottom-10 -right-10 w-64 h-64 text-emerald-500/5 rotate-12" />
          
          <div className="text-center relative z-10 space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                <Leaf className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            
            <div>
              <h1 className="text-xl md:text-2xl font-medium text-white/60 tracking-widest uppercase mb-2">Certificate of Retirement</h1>
              <div className="h-1 w-24 bg-emerald-500/50 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4">
              <p className="text-white/60 text-lg">This certifies that</p>
              <h2 className="text-4xl md:text-6xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                {cert.companyName}
              </h2>
              <p className="text-white/60 text-lg">has permanently retired</p>
              <div className="inline-block bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                <span className="text-3xl font-bold text-emerald-400">{cert.amount}</span>
                <span className="text-white/50 ml-2 font-semibold tracking-wider">Tonnes of CO₂e</span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Project Supported</p>
                <Link href={`/projects/${cert.projectId}`} className="font-semibold text-emerald-400 hover:underline flex items-center gap-1">
                  {cert.projectName} <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Date Retired</p>
                <p className="font-semibold text-white">{cert.timestamp}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Retirement ID</p>
                <p className="font-mono text-sm text-white/80">#{cert.id}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Wallet Address</p>
                <p className="font-mono text-sm text-white/80 truncate" title={cert.wallet}>{cert.wallet}</p>
              </div>
            </div>

          </div>
        </div>
        
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-white/40 text-sm">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          Verified on BOT Chain Testnet
        </div>
      </div>
    </div>
  );
}
