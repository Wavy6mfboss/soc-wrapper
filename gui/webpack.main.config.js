const path              = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode:   "development",
  target: "electron-main",

  entry:  path.resolve(__dirname, "src/index.ts"),
  output: {
    filename: "index.js",
    path:     path.resolve(__dirname, ".webpack/main"),
    libraryTarget: "commonjs2"
  },

  resolve: { extensions: [".ts", ".js"] },

  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: { loader: "ts-loader", options: { transpileOnly: true } }
      }
    ]
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "bin/operate_runner.exe"),
          to:   path.resolve(__dirname, ".webpack/main/bin")
        }
      ]
    })
  ],

  node: { __dirname: false, __filename: false }
};
