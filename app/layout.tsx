import type { Metadata } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSerif = DM_Serif_Display({ 
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif"
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: 'Wander East - Kuliner & Wisata Jawa Timur',
  description: 'Platform informasi kuliner dan wisata terbaik di Jawa Timur. Temukan hidden gems, rekomendasi must-visit, dan bagikan pengalaman perjalananmu.',
  keywords: ['wisata jawa timur', 'kuliner jawa timur', 'surabaya', 'malang', 'batu', 'banyuwangi', 'travel', 'food'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="bg-background">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
