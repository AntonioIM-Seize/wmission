import type { NextConfig } from 'next';
import * as webpackModule from 'next/dist/compiled/webpack/webpack';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: supabaseHostname
    ? {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: supabaseHostname,
            pathname: '/storage/v1/object/public/**',
          },
        ],
      }
    : undefined,
  webpack(config, options) {
    const isEdge = options.nextRuntime === 'edge' || Boolean((options as { middleware?: boolean }).middleware);
    if (isEdge) {
      webpackModule.init();
      config.plugins = config.plugins ?? [];
      config.plugins.push(
        new webpackModule.webpack.DefinePlugin({
          __dirname: JSON.stringify('/'),
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
