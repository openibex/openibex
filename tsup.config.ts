import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // Entry point for your project
  dts: true, // Generate TypeScript declaration file (.d.ts)
  format: ['esm'], // Format as ESM (ES Module)
  target: 'es2022',
  sourcemap: true, // Optional: Generate source maps
  clean: true, // Clean the output directory before building
  outDir: 'dist', // Specify the output directory,
  splitting: false,
  // (At least for the core package)
  // This will resolve the "Dynamic import of 'stream' is not supported" issue
  banner: ({ format }) => {
    if (format === "esm") return ({
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
    })
    return {}
  },

  // node-datachannel (https://github.com/murat-dogan/node-datachannel)
  // has a nasty static import/require statement
  // TODO propose upstream fix
  // exclude it, as packaging fails...
  // Note it'll be used by webrtp only, which is optional
  external: ['node-datachannel']
});