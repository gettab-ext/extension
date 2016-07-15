/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var dir_js = path.resolve(__dirname, 'js');
var dir_html = path.resolve(__dirname, 'html');
var dir_styles = path.resolve(__dirname, 'styles');
var dir_build = path.resolve(__dirname, 'build');
var dir_images = path.resolve(__dirname, 'images');
var dir_fonts = path.resolve(__dirname, 'fonts');
var dir_libs = path.resolve(__dirname, 'libs');
var dir_wallpapers = path.resolve(__dirname, 'wallpapers');

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
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                loader: 'babel-loader',
                test: /\.js$/,
            }
        ]
    },
    plugins: [
        // Simply copies the files over
        new CopyWebpackPlugin([
            {
                from: dir_html // to: output.path
            }, {
                from: dir_styles,
                to: 'styles'
            }, {
                from: dir_images,
                to: 'images'
            }, {
                from: dir_fonts,
                to: 'fonts'
            }, {
                from: dir_libs // to: output.path
            }, {
                from: dir_wallpapers,
                to: 'wallpapers'
            }
        ]),
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin("style.css", {
            allChunks: true
        })
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map',
};
