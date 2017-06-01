var gulp = require("gulp");
var path = require("path");
var wantu = require("../");
gulp.task("wantu", function() {
  gulp.src(path.resolve(__dirname, './files/**')).pipe(wantu({ 
    AK:"****", 
    SK:"***",
    namespace: "****"
  }, { 
    dir: "/test"
  }))
});
