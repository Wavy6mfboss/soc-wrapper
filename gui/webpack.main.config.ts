import path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  /**  ✅  MAIN PROCESS ENTRY POINT  */
  entry: './src/index.ts',

  /**  Output bundle goes into the build dir Forge sets up */
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },

  target: 'electron-main',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },
};

export default config;
