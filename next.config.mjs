/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Allow embedding the app in an iframe from your WordPress domain(s)
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://vinditscandit.co.za https://www.vinditscandit.co.za",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
