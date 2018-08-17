const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');

const common = require('./webpack.common');

const config = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoader: 1 },
          },
          {
            loader: 'postcss-loader',
            options: { plugins: () => [autoprefixer] },
          },
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin('index.css')],
});

module.exports = config;
