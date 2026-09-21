import type { Metadata } from 'next'
import { Playfair_Display, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import AuthGate from './components/AuthGate'
import FloatingHearts from './components/FloatingHearts'
import MonthNav from './components/MonthNav'
import YellowFlowersTheme from './components/YellowFlowersTheme'

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
  title: 'Nuestro Álbum de Amor',
  description: 'Los recuerdos de una historia que seguimos escribiendo juntos',
  applicationName: 'Álbum de Amor',
  appleWebApp: {
    capable: true,
    title: 'Álbum de Amor',
    statusBarStyle: 'default',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${sourceSans.variable}`}>
        <YellowFlowersTheme>
          <AuthGate>
            <FloatingHearts />
            <MonthNav />
            {children}
          </AuthGate>
        </YellowFlowersTheme>
      </body>
    </html>
  )
}
