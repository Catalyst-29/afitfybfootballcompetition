import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AFIT CUP 2026/2027',
    short_name: 'AFIT CUP',
    description: 'AFIT CUP registration portal',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#020b22',
    theme_color: '#020b22',
    icons: [
      { src: '/icons/afit-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/afit-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/afit-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
