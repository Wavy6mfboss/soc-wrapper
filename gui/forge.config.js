// Enable TypeScript configs
require('ts-node').register({ transpileOnly: true });

const path = require('path');
const { WebpackPlugin } = require('@electron-forge/plugin-webpack');

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  /* ----------------------------------------------------------- */
  /*  Packager: bundle wrapper.py + library/ into resources/     */
  /* ----------------------------------------------------------- */
  packagerConfig: {
    asar: false,                           // keep loose files
    extraFiles: [
      {
        from: path.resolve(__dirname, '..', 'wrapper.py'),
        to: 'wrapper.py',
      },
      {
        from: path.resolve(__dirname, '..', 'library'),
        to: 'library',
      },
    ],
  },

  rebuildConfig: {},

  makers: [
    { name: '@electron-forge/maker-squirrel', config: {} },
    { name: '@electron-forge/maker-zip', platforms: ['darwin'], config: {} },
    { name: '@electron-forge/maker-dmg', config: {} },
  ],

  plugins: [
    new WebpackPlugin({
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
