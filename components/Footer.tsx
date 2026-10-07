export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070b0b] py-10 mt-auto">
      <div className="container mx-auto px-4">
        
        {/* BOT Chain Ecosystem Requirement */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 pb-8 border-b border-white/5">
          <span className="text-white/50 text-sm font-medium uppercase tracking-widest">Powered by</span>
          <div className="flex items-center gap-6">
            <a href="https://botchain.ai" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/80 hover:text-emerald-400 transition-colors font-bold text-lg">
              BOT Chain
            </a>
            <a href="https://scan.botchain.ai" target="_blank" rel="noreferrer" className="text-white/50 hover:text-cyan-400 transition-colors text-sm underline underline-offset-4">
              BOT Chain Explorer
            </a>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center space-y-4">
          <p className="text-white/60 text-sm font-light tracking-wide">
            Decentralizing environmental impact, one token at a time.
          </p>
          <p className="text-emerald-500/50 text-xs">
            © {new Date().getFullYear()} CarbonCreditNG
          </p>
        </div>
      </div>
    </footer>
  );
}
