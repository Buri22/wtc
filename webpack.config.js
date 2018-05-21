var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: './dist/bundle.js'
    },
    plugins: [
        new CopyWebpackPlugin([
            {from:'css/*.css',to:'dist'} 
        ]), 
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            }
        ],
        rules: [{
            test: /\.less$/,
            loader: 'less-loader' // compiles Less to CSS
        }]
    }
};