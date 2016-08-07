/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var dir_js = path.resolve(__dirname, 'js');
var dir_build = path.resolve(__dirname, 'build');

module.exports = {
    entry: {
        main: path.resolve(dir_js, 'main.js'),
        background: path.resolve(dir_js, 'background.js'),
        head: path.resolve(dir_js, 'head.js'),
    },
    output: {
        path: dir_build,
        filename: '[name].js'
    },
    devServer: {
        contentBase: dir_build,
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!postcss-loader")
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
                from: path.resolve(__dirname, 'html') // to: output.path
            }, {
                from: path.resolve(__dirname, 'styles'),
                to: 'styles'
            }, {
                from: path.resolve(__dirname, 'images'),
                to: 'images'
            }, {
                from: path.resolve(__dirname, 'fonts'),
                to: 'fonts'
            }, {
                from: path.resolve(__dirname, 'libs') // to: output.path
            }, {
                from: path.resolve(__dirname, 'wallpapers'),
                to: 'wallpapers'
            }, {
                from: path.resolve(__dirname, 'etc', 'manifest.json')
            }, {
                from: path.resolve(__dirname, 'icons'),
                to: 'icons'
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

    postcss:  function (webpack) {
        return [
            require('postcss-nested-ancestors'),
            require('postcss-import')({
                addDependencyTo: webpack
            }),
            require('postcss-mixins'),
            require('postcss-nested'),
            require('postcss-simple-vars')
        ];
    }


};
