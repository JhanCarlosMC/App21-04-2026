import type { Metadata } from 'next'
import { Playfair_Display, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import FloatingHearts from './components/FloatingHearts'
import MonthNav from './components/MonthNav'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair'
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-source-sans'
})

export const metadata: Metadata = {
  title: 'Dos Meses Juntos - Nuestro Álbum',
  description: 'Un recap de todo lo bonito que hemos vivido juntos'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${sourceSans.variable}`}>
        <FloatingHearts />
        <MonthNav />
        {children}
      </body>
    </html>
  )
}
