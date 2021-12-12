var path = require('path');
var webpack = require('webpack');
var WebpackBundleAnalyzer = require('webpack-bundle-analyzer')
var CompressionPlugin = require("compression-webpack-plugin");
var BrotliPlugin = require('brotli-webpack-plugin');

// new WebpackBundleAnalyzer.BundleAnalyzerPlugin()
// new CompressionPlugin()

module.exports = env => ({
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'output'),
        filename: 'bundle.min.js',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|build)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["es2015", "react", "stage-0"],
                        plugins: ["transform-runtime"]
                    }
                }
            },
            {
                test: /\.(png|jpg|gif|wav|svg)$/i,
                exclude: /(node_modules|bower_components|build)/,
                use: {
                    loader: 'url-loader',
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": { 
                NODE_ENV: JSON.stringify("production"),
                MKR: env.MKR
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
        new BrotliPlugin({
            asset: '[path].br[query]',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8
        })
    ]
})
