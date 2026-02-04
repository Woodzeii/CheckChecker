import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"



const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CheckChecker - Личный кабинет',
  description: 'Личный кабинет для работы с чеками. Загружайте, анализируйте и отслеживайте свои расходы.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`font-sans antialiased`}>
        <ReduxProvider>
          {children}
          <Toaster />
        </ReduxProvider>
        <Analytics />
      </body>
    </html>
  )
}
