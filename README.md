# gulp-wantu

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
