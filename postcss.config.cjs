// postcss.config.cjs
// Use CJS syntax for maximum compatibility with Next.js build system

module.exports = {
  plugins: {
    // Explicitly load Tailwind CSS
    'tailwindcss/nesting': {},
    'tailwindcss': {},
    'autoprefixer': {},
  },
};
