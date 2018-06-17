var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: './dist/bundle.js'
    },
    plugins: [
        new CopyWebpackPlugin([
            {from:'css/*.css',to:'dist'} 
        ]),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default']
        })
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