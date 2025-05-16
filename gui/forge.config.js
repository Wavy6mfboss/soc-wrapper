require('ts-node').register({ transpileOnly: true });

const path = require('path');
const { WebpackPlugin } = require('@electron-forge/plugin-webpack');

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  /* ---------------------------------------------------------------- */
  /* Packager: include frozen CLI (bin/), library/, and wrapper.py    */
  /* ---------------------------------------------------------------- */
  packagerConfig: {
    asar: false,
    extraResource: [
      path.resolve(__dirname, '..', 'bin'),        // → resources/bin/operate_runner.exe
      path.resolve(__dirname, '..', 'library'),    // → resources/library/…
      path.resolve(__dirname, '..', 'wrapper.py'), // (optional: for fallback or debugging)
    ],
  },

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
