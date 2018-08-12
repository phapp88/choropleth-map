const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');

const common = require('./webpack.common');

const config = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            { loader: 'postcss-loader', options: { plugins: () => [autoprefixer] } },
          ],
        }),
      },
    ],
  },
  plugins: [new ExtractTextPlugin('index.css')],
});

module.exports = config;
