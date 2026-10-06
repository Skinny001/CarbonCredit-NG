'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, Coins } from 'lucide-react';
import { getSigner, getUSDTWithSigner } from '@/lib/web3';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [address, setAddress] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const disconnectWallet = () => {
    setAddress(null);
    setShowDropdown(false);
    toast.success("Wallet disconnected (Local App State)");
  };

  const connectWallet = async () => {
    try {
      const signer = await getSigner();
      setAddress(await signer.getAddress());
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect wallet');
    }
  };

  const handleMintUSDT = async () => {
    if (!address) return toast.error("Please connect your wallet first");
    try {
      setMinting(true);
      const usdtContract = await getUSDTWithSigner();
      // Mint 10,000 USDT (with 18 decimals)
      const amount = ethers.parseUnits("10000", 18);
      const tx = await usdtContract.mint(address, amount);
      await tx.wait();
      toast.success("Successfully minted 10,000 Mock USDT to your wallet!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.reason || e.message || "Failed to mint USDT");
    } finally {
      setMinting(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
       window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
           if (accounts.length > 0) setAddress(accounts[0]);
       });
    }
  }, []);

  return (
    <nav className="border-b border-white/10 bg-[#0b1515]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-emerald-400 font-semibold text-lg">
          <img src="/logo.jpg" alt="CarbonCreditNG Logo" className="w-8 h-8 rounded shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="tracking-wide">CarbonCreditNG</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-white/80">
          <Link href="/projects" className="hover:text-emerald-400 transition-colors">Projects</Link>
          <Link href="/market" className="hover:text-emerald-400 transition-colors">Market</Link>
          <Link href="/ngo" className="hover:text-emerald-400 transition-colors">NGO</Link>
          <Link href="/verifier" className="hover:text-emerald-400 transition-colors">Verifier</Link>
          <Link href="/company" className="hover:text-emerald-400 transition-colors">Company</Link>
          <Link href="/admin" className="hover:text-emerald-400 transition-colors">Admin</Link>
          
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            {address && (
              <button 
                onClick={handleMintUSDT}
                disabled={minting}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                <Coins className="w-4 h-4" />
                {minting ? 'Minting...' : 'Get USDT'}
              </button>
            )}
            
            {!address ? (
              <button 
                onClick={connectWallet}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] font-semibold"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] font-semibold flex items-center gap-2"
                >
                  {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                  <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0b1515] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                    <button 
                      onClick={disconnectWallet}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
