import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

/* Add CSS handling */
rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

/* Replace the existing TS rule (if any) with one that skips type‑check */
rules.push({
  test: /\.ts$/,
  exclude: /node_modules/,
  use: {
    loader: 'ts-loader',
    options: { transpileOnly: true }, // ⚡ skip type‑checking
  },
});

export const rendererConfig: Configuration = {
  module: { rules },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
