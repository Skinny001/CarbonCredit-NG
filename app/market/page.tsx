'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMarketContract, getMarketWithSigner, getUSDTWithSigner, getProjectsContract } from '@/lib/web3';
import { ShoppingCart, Leaf, Info } from 'lucide-react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function Market() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [buyAmount, setBuyAmount] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchListings() {
      try {
        const marketContract = getMarketContract();
        const projectsContract = getProjectsContract();
        const active = await marketContract.listActive(0, 100);
        
        const formatted = await Promise.all(active.map(async (l: any) => {
          const project = await projectsContract.getProject(l.projectId);
          return {
            id: l.id.toString(),
            projectId: l.projectId.toString(),
            projectName: project.name,
            seller: l.seller,
            amount: l.amount.toString(),
            pricePerTonne: (Number(l.pricePerTonne) / 1e18).toString(),
            active: l.active
          };
        }));
        
        setListings(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const handleBuy = async (listingId: string, maxAmount: number, priceStr: string) => {
    const amountToBuy = Number(buyAmount[listingId] || 1);
    if (!amountToBuy || amountToBuy <= 0 || amountToBuy > maxAmount) {
      toast.error("Please enter a valid amount between 1 and " + maxAmount);
      return;
    }

    try {
      setBuyingId(listingId);
      const usdtContract = await getUSDTWithSigner();
      const marketContract = await getMarketWithSigner();
      const marketAddress = await marketContract.getAddress();

      const pricePerTonne = ethers.parseUnits(priceStr, 18);
      const totalCost = pricePerTonne * BigInt(amountToBuy);

      console.log("Approving USDT...");
      const approveTx = await usdtContract.approve(marketAddress, totalCost);
      await approveTx.wait();

      console.log("Buying...");
      const buyTx = await marketContract.buy(listingId, amountToBuy);
      await buyTx.wait();

      toast.success("Purchase successful! You can now retire these credits from your Dashboard.");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error(e);
      toast.error(e.reason || e.message || "Purchase failed");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Carbon Marketplace</h1>
        <p className="text-white/60 text-lg font-light">Purchase verified carbon credits to offset your company's emissions. Credits are priced in testnet USDT.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 && (
            <div className="col-span-full text-center text-white/40 py-20 bg-white/5 rounded-2xl border border-white/10">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <p>No active listings found in the marketplace right now.</p>
            </div>
          )}
          {listings.map((listing) => (
            <div key={listing.id} className="bg-[#0b1515] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{listing.projectName}</h3>
                  <Link href={`/projects/${listing.projectId}`} className="text-xs text-emerald-400 hover:underline">View Project Info</Link>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full text-sm border border-emerald-500/20">
                  {listing.pricePerTonne} USDT
                </div>
              </div>
              
              <div className="space-y-4 mb-6 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50 uppercase tracking-wider text-xs">Available Volume</span>
                  <span className="font-bold text-white">{listing.amount} tCO2e</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50 uppercase tracking-wider text-xs">Seller</span>
                  <span className="font-mono text-white/80 bg-white/5 px-2 py-0.5 rounded">{listing.seller.substring(0,6)}...{listing.seller.substring(38)}</span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Amount to Buy (tCO2e)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={listing.amount}
                    value={buyAmount[listing.id] || ''}
                    onChange={(e) => setBuyAmount({...buyAmount, [listing.id]: e.target.value})}
                    placeholder="Enter amount"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                
                {buyAmount[listing.id] && Number(buyAmount[listing.id]) > 0 && (
                  <div className="flex justify-between items-center text-sm px-1">
                    <span className="text-white/50">Total Cost:</span>
                    <span className="font-bold text-emerald-400">{(Number(buyAmount[listing.id]) * Number(listing.pricePerTonne)).toFixed(2)} USDT</span>
                  </div>
                )}

                <button 
                  onClick={() => handleBuy(listing.id, Number(listing.amount), listing.pricePerTonne)}
                  disabled={buyingId === listing.id}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex justify-center items-center gap-2"
                >
                  {buyingId === listing.id ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</>
                  ) : (
                    <>Buy Credits</>
                  )}
                </button>
                <div className="text-[10px] text-white/40 flex items-start gap-1 mt-2">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />
                  Requires 2 transactions: First to approve USDT spending, second to execute purchase.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
