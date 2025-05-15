// ─── Enable TypeScript configs ──────────────────────────────────
import 'ts-node/register';

import type { ForgeConfig } from '@electron-forge/shared-types';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import path from 'path';

const config: ForgeConfig = {
  packagerConfig: { asar: true },
  rebuildConfig: {},

  // ---------- Makers ----------
  makers: [
    { name: '@electron-forge/maker-squirrel', config: {} },
    { name: '@electron-forge/maker-zip', platforms: ['darwin'], config: {} },
    { name: '@electron-forge/maker-dmg', config: {} },
  ],

  // ---------- Webpack ----------
  plugins: [
    new WebpackPlugin({
      // pass *paths* to the TS configs
      mainConfig: path.join(__dirname, 'webpack.main.config.ts'),
      renderer: {
        config: path.join(__dirname, 'webpack.renderer.config.ts'),
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: { js: './src/preload.ts' },
          },
        ],
      },
    }),
  ],
};

export default config;
