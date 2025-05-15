import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

/* CSS */
rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

/* TS (skip type‑check) */
rules.push({
  test: /\.ts$/,
  exclude: /node_modules/,
  use: {
    loader: 'ts-loader',
    options: { transpileOnly: true },
  },
});

/* ─── Final renderer config ─── */
const config: Configuration = {
  module: { rules },
  plugins,
  resolve: { extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'] },
};

export default config;     // 👈 default export, no extra wrapper
