const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "production",
  context: path.resolve(__dirname, './src'),
  entry: {
    app: [
      './scss/main.scss'
    ]
  },
  plugins: [
    new MiniCssExtractPlugin,
    new CopyWebpackPlugin({
      patterns: [
        { from: './**/*.ejs'},
        { from: './**/*.html'}
      ]
    })
  ],
  output: {
    path: path.resolve(__dirname, './dist')
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
}
