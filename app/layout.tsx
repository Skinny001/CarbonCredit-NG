import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CarbonCreditNG | Verified climate impact',
  description: 'A transparent marketplace for verified carbon removal on BOT Chain.',
  generator: 'CarbonCreditNG',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b1515',
}

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#0b1515] text-white">
        <Toaster 
          position="bottom-right" 
          toastOptions={{ 
            style: { background: '#0e1c1b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }
          }} 
        />
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
