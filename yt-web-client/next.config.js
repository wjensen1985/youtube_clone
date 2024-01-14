/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'storage.googleapis.com',
            }
        ],
        domains: ['storage.googleapis.com'],
    },
}

module.exports = nextConfig
