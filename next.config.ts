import type { NextConfig } from 'next';

function cmsRemotePattern(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const configured = process.env.CMS_IMAGE_BASE_URL?.trim();
  if (!configured) return [];

  const url = new URL(configured);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('CMS_IMAGE_BASE_URL must use http or https.');
  }

  return [{
    protocol: url.protocol.slice(0, -1) as 'http' | 'https',
    hostname: url.hostname,
    port: url.port,
    pathname: `${url.pathname.replace(/\/$/, '') || ''}/**`,
  }];
}

const config: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: cmsRemotePattern(),
  },
};

export default config;
