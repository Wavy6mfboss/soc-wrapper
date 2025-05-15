import 'ts-node/register';                     // let Node run *.ts imports
import type { ForgeConfig } from '@electron-forge/shared-types';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

// load TS webpack configs via require().default
const mainConfig     = require('./webpack.main.config').default;
const rendererConfig = require('./webpack.renderer.config').default;

const config: ForgeConfig = {
  packagerConfig: { asar: true },
  rebuildConfig: {},

  makers: [
    { name: '@electron-forge/maker-squirrel', config: {} },
    { name: '@electron-forge/maker-zip', platforms: ['darwin'], config: {} },
    { name: '@electron-forge/maker-dmg', config: {} },
  ],

  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
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
