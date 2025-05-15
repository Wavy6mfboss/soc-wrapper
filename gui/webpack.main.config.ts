import path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  /* ─── Main‑process entry file ──────────────────────────────── */
  entry: './src/index.ts',

  /* ─── Bundle destination (Forge copies this for packaging) ── */
  output: {
  filename: 'index.js',                          // ← must be index.js
  path: path.resolve(__dirname, '.webpack/main') // ← where Forge looks
},

  target: 'electron-main',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true }, // ⚡ skip type‑checking
        },
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },
};

export default config;
