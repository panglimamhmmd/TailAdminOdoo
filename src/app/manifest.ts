import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'TailAdmin Dashboard',
        short_name: 'TailAdmin',
        description: 'A modern admin dashboard built with Next.js',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#465FFF',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/pwa-icon.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'maskable',
            },
            {
                src: '/pwa-icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable',
            }
        ],
    }
}
