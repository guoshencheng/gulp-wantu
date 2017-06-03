# [gulp-wantu](http://baichuan.taobao.com/product/multimedia.htm?spm=a3c0d.7629140.1998907816.3.ynTL6y)

> 上传资源到wantu

### Install

```
npm install gulp-wantu --save-dev

```

### Usage

示例代码

```javascript

  gulp.src(path.resolve(__dirname, './files/**')).pipe(wantu({ 
    AK:"****", 
    SK:"***",
    namespace: "****"
  }, { 
    dir: "/test"
  }))

```
- [x] retry when upload failed
- [ ] add summary when finish upload

## [License](https://github.com/guoshencheng/gulp-wantu/blob/master/LICENSE)
