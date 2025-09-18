import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [],
  },
  devIndicators: {
    allowedDevOrigins: [
        '9003-firebase-studio-1758091739366.cluster-nle52mxuvfhlkrzyrq6g2cwb52.cloudworkstations.dev'
    ]
  },
  env: {}
};

export default nextConfig;
