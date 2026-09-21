import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Nuestro Álbum de Amor',
    short_name: 'Álbum de Amor',
    description: 'Los recuerdos de una historia que seguimos escribiendo juntos',
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFF0F5',
    theme_color: '#AA5266',
    icons: [
      { src: '/icons/album-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/album-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/album-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
