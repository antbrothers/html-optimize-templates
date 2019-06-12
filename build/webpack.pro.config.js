const path = require('path')
const webpack = require('webpack')
var lodash = require('lodash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const merger = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.config')

const glob = require('glob')

function getEntry(globPath) {
    var entries = {},
        basename, tmp;

    glob.sync(globPath).forEach(function (entry) {
        basename = path.basename(entry, path.extname(entry));
        tmp = entry.split('/').splice(-3);
        // 过滤掉本模块的 ejs 的入口文件
        if (path.extname(entry).indexOf('.ejs') > -1 && tmp[2].indexOf(tmp[1]) === -1 || path.extname(entry).indexOf('.js') > -1) {
            // if (basename === 'preview') {
            //     entries[tmp[1] + '.preview'] = entry;
            // } else {
            //     entries[basename] = entry;
            // }
            if (basename !== 'preview') {
                entries[basename] = entry
            }
        }
    });
    return entries;
}
const Entry = getEntry('./src/components/**/*.js')
const HtmlTpl = getEntry('./src/**/*.ejs')

const htmlConfig = () => {
    let config = []
    for (let attr in HtmlTpl) {
        if (attr.indexOf('preview') === -1) { // 首页 和导航页面
            config.push(
                new HtmlWebpackPlugin({
                    title: 'XXX',
                    filename: `./${attr}.html`,
                    template: HtmlTpl[attr],
                    chunks: ['lib', 'runtime','common', 'app'], // 选择要打包js 入口文件
                    chunksSortMode: 'manual',  // 顺序插入js
                    inject: false,                    
                    minify: { //压缩HTML文件    
                        minifyJS: true,           // 仅压缩内联在html里面的js
                        minifyCSS: true,          // 仅压缩内联在html里面的css
                        html5: true,              // 以html5的文档格式解析html的模板文件
                        removeComments: false,    // 不删除Html文件里面的注释
                        collapseWhitespace: true, // 删除空格
                        preserveLineBreaks: false // 删除换行
                    },
                    injectCriticalCss(htmlWebpackPluginStats, compilation) {                        
                        return lodash(htmlWebpackPluginStats.files.chunks)
                            .map(chunk => chunk.css)
                            .flatten()
                            .filter(cssFilename => /^css\b/.test(cssFilename))
                            .map(cssFilename => `<style>${
                                compilation.assets[cssFilename].source()
                                }</style>`)
                            .join('\n');
                    },
                    injectNonCriticalCss(htmlWebpackPluginStats) {
                        var p = []
                         lodash(htmlWebpackPluginStats.files.chunks)
                            .map(chunk => chunk.entry)
                            .flatten()
                            .filter(jsFilename => /^js\b/.test(jsFilename))   
                            .map(jsFilename => p.push(jsFilename))
                            .join('\n');
                        return `<script type="text/javascript" src="/dinamic/??${p.join(',')}"></script>`
                    }
                })
            )
        } else if (attr.indexOf('preview') > -1) { // 模块预览
            config.push(
                new HtmlWebpackPlugin({
                    title: 'XXX',
                    filename: `./${attr}.html`,
                    template: HtmlTpl[attr],
                    chunks: ['common', HtmlTpl[attr].split('/')[3]], // 预览模块js独立打包
                    chunksSortMode: 'manual',
                    inject: false,                    
                    minify: { //压缩HTML文件    
                        minifyJS: true,           // 仅压缩内联在html里面的js
                        minifyCSS: true,          // 仅压缩内联在html里面的css
                        html5: true,              // 以html5的文档格式解析html的模板文件
                        removeComments: false,    // 不删除Html文件里面的注释
                        collapseWhitespace: true, // 删除空格
                        preserveLineBreaks: false // 删除换行
                    },
                    injectCriticalCss(htmlWebpackPluginStats, compilation) {                        
                        return lodash(htmlWebpackPluginStats.files.chunks)
                            .map(chunk => chunk.css)
                            .flatten()
                            .filter(cssFilename => /^css\b/.test(cssFilename))
                            .map(cssFilename => `<style>${
                                compilation.assets[cssFilename].source()
                                }</style>`)
                            .join('\n');
                    },
                    injectNonCriticalCss(htmlWebpackPluginStats) {
                        var p = []
                         lodash(htmlWebpackPluginStats.files.chunks)
                            .map(chunk => chunk.entry)
                            .flatten()
                            .filter(jsFilename => /^js\b/.test(jsFilename))   
                            .map(jsFilename => p.push(jsFilename))
                            .join('\n');
                        return `<script type="text/javascript" src="/dinamic/??${p.join(',')}"></script>`
                    }
                })
            )
        } else {
        }
    }
    return config;
}

module.exports = merger(baseWebpackConfig, {
    entry: Entry,
    output: {
        filename: 'js/[name].[hash].js',
        path: path.resolve(__dirname, '..', 'dist'),
        publicPath: '' //也会在服务器脚本用到
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.NoEmitOnErrorsPlugin(),
        new ExtractTextPlugin('css/[name].[hash].css'),
        // new webpack.ProvidePlugin({
        //     $: "jquery",
        //     jQuery: "jquery"
        // }),
        new UglifyJSPlugin({
            uglifyOptions: {
                ie8: false,
                output: {
                    comments: false,
                    beautify: false,
                },
                mangle: {
                    keep_fnames: true
                },
                compress: {
                    warnings: false,
                    drop_console: true
                },
            }
        }),
    ].concat(htmlConfig()),
    mode: 'production'
})
