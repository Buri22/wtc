var path = require('path'); // required for "resolve" option 

module.exports = {
  mode: 'development',
  entry: ['./src/index.js'],
  output: {
    path: __dirname,
    publicPath: '/wtc/',
    filename: 'dist/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'css-loader' // translates CSS into CommonJS
        }, {
          loader: 'less-loader' // compiles Less to CSS
        }]
      }, 
      {
        test: /\.jsx$|\.es6$|\.js$/, // must be at the first place, otherwise it would also try to load css files
        exclude: /node_modules/, // if you want to use less files from node_modules libraries, delete this line
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react', 'stage-1']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.png$/,
        use: [{
          loader: "url-loader?limit=100000&outputPath=./dist"
        }]
      },
      {
        test: /\.(jpg|gif)$/,
        use: [{
          loader: "file-loader"
        }]
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?limit=10000&mimetype=application/font-woff&outputPath=./dist'
        }]
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?limit=10000&mimetype=application/octet-stream&outputPath=./dist'
        }]
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader'
        }]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?limit=10000&mimetype=image/svg+xml&outputPath=./dist'
        }]
      },
      /*  Webpack 2.0+ has native JSON support
      {
        test: /\.json$/, // json loader (used for moduleConfig.json)
        use: [{
          loader: 'json-loader'
        }]
      }*/
    ]
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ],
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './',
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
};