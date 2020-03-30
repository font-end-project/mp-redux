module.exports = {
  entry: "./index.js",
  output: {
    filename: "./index.js"
  },
  mode: "production",

  /* webpack-dev-server配置 */
  devServer: {
    publicPath: "/dist"
  }
};
