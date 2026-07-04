export default function manifest() {
  return {
    name: 'Ledgerline Personal Finance',
    short_name: 'Ledgerline',
    description: 'AI-Powered Personal Finance Manager',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F5EF',
    theme_color: '#0F6E56',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
