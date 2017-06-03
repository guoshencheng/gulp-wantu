var WANTU = require("wantu-nodejsSDK");
var through = require("through2");
var log = require("gulp-util").log;
var colors = require("gulp-util").colors;
var path = require("path");
const MAX_RETRY = 3;

function WantuUploadFaildError(message) {
  this.name = "WantuUploadFaildError";
  this.message = message || "wantu upload faild error";
  this.stack = (new Error()).stack;
}

WantuUploadFaildError.prototype = Object.create(Error.prototype);
WantuUploadFaildError.prototype.constructor = WantuUploadFaildError;


const upload = (wantu, config, dir, filepath, name) => {
  const uploadPolicy = {
    insertOnly: 0,
    expiration: -1,
    namespace: config.namespace,
    // sizeLimit: 1024 * 5,
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

const uploadQueue = (wantu, config, dir, filepath, name, fileKey) => {
  let retry = 0;
  let uploadHandler = (data => {
    if (data.code == "OK") {
      return data;
    } else {
      if (retry < MAX_RETRY) {
        retry ++;
        log("Upload faild, Start retry Upload retry times " + retry + " →", colors.cyan(fileKey));
        return upload(wantu, config, dir, filepath, name).then(uploadHandler);
      } else {
        throw new WantuUploadFaildError(data.message);
      }
    }
  })
  return upload(wantu, config, dir, filepath, name).then(uploadHandler);
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
    exist(wantu, config, dirname, filename).catch(error => {
      log(colors.red("check file exist fiald. please check your net work setting"));
      throw error;
    }).then(data => {
      if (data.exist == 0) {
        log("Start upload →", colors.magenta(fileKey));
        return uploadQueue(wantu, config, dirname, file.path, filename, fileKey)
      } else {
        return false;
      }
    }).then(data => {
      if ( data ) {
        log("Upload success →", colors.green(fileKey));
      } else {
        log("Skip →", colors.grey(fileKey));
      } 
      next()
    }).catch(error => {
      if (error instanceof WantuUploadFaildError) {
        log("Upload faild →", colors.red(fileKey), colors.yellow(" retry too many times"));
        log("Error message →", colors.red(error.message));
      } else {
        log("Upload faild →", colors.red(fileKey), colors.yellow(" with error message:" + err.message));
      }
      next()
    })
  })
}
