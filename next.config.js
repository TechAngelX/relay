/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set the default port for `next dev`
  // This is used when the PORT environment variable is not explicitly set.
  dev: {
    port: 5173,
  },
  
  // Note: Your Turbopack configuration (if used) will respect this port setting.
};

module.exports = nextConfig;
