"use strict";

var gulp = require("gulp");
var Config = require('./gulpfile.config');
var concat = require('gulp-concat');

var config = new Config();

gulp.task('concat-js', function () {
    return gulp.src(config.allJavaScript)
      .pipe(concat('app.js'))
      .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', ['concat-js'], function () {
    gulp.watch(config.allFiles, ['concat-js']);
});

gulp.task('default', ['concat-js', 'watch']);