const path               = require("path");
const { WebpackPlugin }  = require("@electron-forge/plugin-webpack");

module.exports = {
  packagerConfig: {
    icon: path.join(__dirname, "assets", "icon")   // optional
  },

  plugins: [
    new WebpackPlugin({
      // relaxed CSP for hot-reload during dev
      devContentSecurityPolicy:
        "default-src 'self'; "            +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src  'self' 'unsafe-inline';",

      /* ── main process ── */
      mainConfig: path.resolve(__dirname, "webpack.main.config.js"),

      /* ── Renderer(s) ── */
      renderer: {
        config: path.resolve(__dirname, "webpack.renderer.config.js"),
        entryPoints: [
          {
            name : "main_window",
            html : path.resolve(__dirname, "src/index.html"),
            js   : path.resolve(__dirname, "src/renderer.ts"),
            preload: {
              js: path.resolve(__dirname, "src/preload.ts")
            }
          }
        ]
      }
    })
  ]
};
