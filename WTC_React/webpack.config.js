module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: __dirname,
    publicPath: '/',
    filename: 'dist/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/, // CSS loader (used for style loading)
        loaders: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(png|jpg|gif|ttf|svg|woff|woff2|eot)$/, // file loader (used for loading.gif)
        loader: 'file-loader'
      },
      {
        test: /\.json$/, // json loader (used for moduleConfig.json)
        loader: 'json-loader'
      },
      {
        exclude: /node_modules/,
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015', 'stage-1']
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
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
