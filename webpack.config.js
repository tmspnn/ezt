const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv == "production";
const rxPaths = require("rxjs/_esm5/path-mapping");

module.exports = {
  mode: isProd ? "production" : "development",
  devtool: isProd ? "hidden-source-map" : "cheap-eval-source-map",
  context: __dirname + "/src",
  entry: { ezt: "./ezt.ts" },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
    publicPath: isProd ? "/" : "",
    library: "ezt",
    libraryTarget: "umd",
    globalObject: "this"
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: "awesome-typescript-loader"
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: [__dirname + "/src", "node_modules"],
    alias: rxPaths()
  },
  plugins: [new BundleAnalyzerPlugin()]
};
