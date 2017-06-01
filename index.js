var WANTU = require("wantu-nodejsSDK");
var through = require("through2");
var log = require("gulp-util").log;
var colors = require("gulp-util").colors;
var path = require("path");

const MAX_RETRY = 3;

const upload = (wantu, config, dir, filepath, name) => {
  const uploadPolicy = {
    insertOnly: 0,
    expiration: -1,
    namespace: config.namespace,
    name
  }
  return new Promise((resolve, reject) => {
    wantu.singleUpload(uploadPolicy, filepath, dir, "", "", (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(result.data));
      }
    })
  });
}

const exist = (wantu, config, dir, filename) => {
  return new Promise((resolve, reject) => {
    wantu.existFile(config.namespace, dir, filename, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(result.data));
      }
    })
  });
}

module.exports = function(config, option) { 
  option = Object.assign({ dir: '/' }, option);
  var wantu = new WANTU(config.AK, config.SK);
  return through.obj(function (file, enc, next){
    const retry = 0;
    var relativePath = path.relative(file.base, file.path);
    relativePath = relativePath.split(path.sep).join('/');
    var dirname = path.dirname(path.resolve(option.dir, relativePath));
    var filename = path.basename(relativePath);
    var fileKey = dirname + "/" + filename;
    if (file._contents === null) return next();
    exist(wantu, config, dirname, filename).then(data => {
      if (data.exist == 0) {
        log("Start upload →", colors.yellow(fileKey));
        return upload(wantu, config, dirname, file.path, filename)
      } else {
        log("Skip →", colors.grey(fileKey));
        next()
      }
    }).then(data => {
      if ( data ) {
        if (data.code == "OK") {
          log("Upload success →", colors.green(fileKey));
        } else {
          log("Upload failed →", colors.red(fileKey));
        }
      }
      return next()
    })
  })
}
