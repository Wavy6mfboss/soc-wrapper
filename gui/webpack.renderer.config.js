const path               = require("path");
const HtmlWebpackPlugin  = require("html-webpack-plugin");

module.exports = {
  mode:   "development",
  target: "electron-renderer",

  entry: {
    main_window: path.resolve(__dirname, "src/renderer.ts")
  },

  output: {
    filename: "[name]/index.js",
    path:     path.resolve(__dirname, ".webpack", "renderer"),
    clean:    true
  },

  resolve: {
    extensions: [".ts", ".js"],
    /** polyfill Node-core modules the dev-server client expects */
    fallback:   { events: require.resolve("events") }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: { loader: "ts-loader", options: { transpileOnly: true } }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      filename: "index.html",
      chunks:   ["main_window"]
    })
  ],

  /** optional: turn off HMR to avoid extra require()’s */
  devServer: {
    hot: false,
    liveReload: false
  }
};
