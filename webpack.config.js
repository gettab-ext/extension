/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var dir_js = path.resolve(__dirname, 'js');
var dir_html = path.resolve(__dirname, 'html');
var dir_styles = path.resolve(__dirname, 'styles');
var dir_build = path.resolve(__dirname, 'build');
var dir_images = path.resolve(__dirname, 'images');
var fonts_images = path.resolve(__dirname, 'fonts');

module.exports = {
    entry: path.resolve(dir_js, 'main.js'),
    output: {
        path: dir_build,
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: dir_build,
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                loader: 'babel-loader',
                test: dir_js,
            }
        ]
    },
    plugins: [
        // Simply copies the files over
        new CopyWebpackPlugin([
            { from: dir_html } // to: output.path
        ]),
        new CopyWebpackPlugin([
            { from: dir_styles } // to: output.path
        ]),
        new CopyWebpackPlugin([
            {
                from: dir_images,
                to: 'images'
            } // to: output.path
        ]),
        new CopyWebpackPlugin([
            {
                from: fonts_images,
                to: 'fonts'
            } // to: output.path
        ]),
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin()
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map',
};
