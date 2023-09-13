import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/SessionProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SyncShift',
  description: 'Productivity Tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
  <Providers>
    <body className={`${inter.className} bg-black`}>
      {children}
    </body>
  </Providers>
</html>

  )
}
