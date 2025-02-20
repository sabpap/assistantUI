import type { Metadata } from 'next'
import { config } from './config'
import './globals.css'

export const metadata: Metadata = {
  title: config.appTitle,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
