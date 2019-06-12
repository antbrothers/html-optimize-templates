/*
 * @Author: linjianx 
 * @Desc: 解析静态资源路径
 * @Date: 2019-06-10 11:35:04 
 * @Last Modified by: linjianx
 * @Last Modified time: 2019-06-12 11:13:56
 */
const fs = require("fs")
const path = require('path')
var MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.html': 'text/html'
};
/**
 * Desc : 此处为串读取文件，当请求的文件多，需要合并的数据也比较大时，会拖慢服务器的消耗时间
 * 虽然每一次都会完整的把数据读到内存并且缓存起来，当服务器并发比较大时,就会有较大的内存开销
 * 优化：采用流式读取方式：一遍读取，一遍输出，把相应的输出时机提前至读取第一个文件的时刻 即使调用（fs.createReadStream）
 * @param {*} pathnames 
 * @param {*} callback 
 */
function combineFiles(pathnames, callback, compiler) {
    var output = [];
    (function next(i, len) {
        if (i < len) {
            if (process.argv[2] == 'development') {
                compiler.outputFileSystem.readFile(pathnames[i], function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        output.push(result);
                        next(i + 1, len);
                    }
                })
            } else {
                fs.readFile(pathnames[i], function (err, data) {
                    if (err) {
                        callback(err);
                    } else {
                        output.push(data);
                        next(i + 1, len);
                    }
                });
            }

        } else {
            const data = Buffer.concat(output);
            console.log(data);

            callback(null, data);
        }
    }(0, pathnames.length));
}
// 解析文件路径
function parseURL(root, url) {
    var base, pathnames, parts;

    if (url.indexOf('??') === -1) {
        url = url.replace('/', '/??');
    }

    parts = url.split('??');
    // base = parts[0];
    base = '../dist/'
    if (parts[1].indexOf(',') === -1) {
        pathnames = path.join(root, base, parts[1])
    }
    pathnames = parts[1].split(',').map(function (value) {
        var filePath = path.join(root, base, value);
        return filePath;
    });
    return {
        mime: MIME[path.extname(pathnames[0])] || 'text/plain',
        pathnames: pathnames
    };
}

function main(request, response, compiler) {
    var urlInfo = parseURL(__dirname, request.url)
    console.log('获取静态路径')
    console.log(urlInfo)
    combineFiles(urlInfo.pathnames, function (err, data) {
        if (err) {
            response.writeHead(404);
            response.end(err.message);
        } else {
            response.writeHead(200, {
                'Content-Type': urlInfo.mime
            })
            response.end(data)
        }
    }, compiler)
}
module.exports = main