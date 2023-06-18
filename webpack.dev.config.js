const webpack = require('webpack');
var path = require('path');

module.exports = env => ({
    entry: './src/index.js',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname,'output'),
        filename: 'bundle.js',
        libraryTarget: 'umd',
        // publicPath: 'http://192.168.0.13:9000/'
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.MKR": env.MKR 
        })
    ],
    devServer: {
        // host: '192.168.0.13',
        host:'localhost',
        publicPath: '/',
        contentBase: path.resolve(__dirname),
        watchContentBase: true,
        compress: true,
        port: 9000,
        open: true,
        proxy:{
            "/fsjson": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/fsjson"
            },
            "/addwav": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/addwav"
            },
            "/addrack": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/addrack"
            },
            "/updateVoiceConfig": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/updateVoiceConfig"
            },
            "/updateSingleVoiceConfig": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/updateSingleVoiceConfig"
            },
            "/updatePinConfig": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/updatePinConfig"
            },
            "/addfirmware": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/addfirmware"
            },
            "/addgui": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/addgui"
            },
            "/bootFromEmmc": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/bootFromEmmc"
            },
            "/rpc": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/rpc"
            },
            "/updaterecoveryfirmware": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/updaterecoveryfirmware"
            },
            "/updateMetadata": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/updateMetadata"
            },
            "/voicejson": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/voicejson"
            },
            "/configjson": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/configjson"
            },
            "/update": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/update"
            },
            "/wvr_emmc_backup.bin": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/wvr_emmc_backup.bin"
            },
            "/deleteFirmware": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/deleteFirmware"
            },
            "/playWav": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/playWav"
            },
            "/emmcReset": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/emmcReset"
            },
            "/restoreEMMC": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/restoreEMMC"
            },
            "/fetchLocalIP": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/fetchLocalIP"
            },
            "/tryLogonLocalNetwork": {
                "changeOrigin": true,
                "cookieDomainRewrite": "localhost",
                "target": "http://192.168.5.18/tryLogonLocalNetwork"
            }
        }
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
                test: /\.(png|jpg|gif|svg|wav)$/i,
                exclude: /(node_modules|bower_components|build)/,
                use: {
                    loader: 'url-loader',
                }
            }
        ]
    }
})
