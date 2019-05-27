const path = require('path')
const webpack = require('webpack')
var autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin') //从js中抽出css
function resolve(dir) {
    return path.join(__dirname, '..', dir)
}
module.exports = {
    entry: {
        flexble: path.resolve(__dirname, '..', 'src/assets/flexible/flexible.js'),
        app: path.resolve(__dirname, '..', 'src/app.js'),
        lib: path.resolve(__dirname, '..', 'src/lib.js'),
        common: path.resolve(__dirname, '..', 'src/verdors.js')
    },
    module: {
        rules: [
            {
                test: /\.ejs$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'underscore-template-loader'
                }]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src')]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader'
                        }
                    ]
                })
            },
            {
                test: /.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                modules: false,
                                camelCase: 'dashes',
                                minimize: true
                            }
                        },
                        {
                            loader: 'less-loader'
                        }
                    ]
                })              
                // loader: 'style-loader!css-loader?minimize!less-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    name: '[name].[ext]',
                    outputPath: 'images/'
                }
            }
        ]
       
    },    
    resolve: {
        extensions: ['.js', '.json', '.ejs'],
        alias: {
            '@': resolve('src')
        }
    },
    optimization: {
        runtimeChunk: {
            "name": "runtime"
        }
    }
}