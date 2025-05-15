import type { ForgeConfig } from '@electron-forge/shared-types';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import mainConfig from './webpack.main.config';
import rendererConfig from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: { asar: true },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {},
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {},
    },
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
