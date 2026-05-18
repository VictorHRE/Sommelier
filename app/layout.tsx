import './globals.css'
import type { Metadata } from 'next'
import { config } from '@/config'

export const metadata: Metadata = {
  title: config.metadata.title,
  description: config.metadata.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang={config.sommelier.language}>
      <body>
        {children}
      </body>
    </html>
  )
}