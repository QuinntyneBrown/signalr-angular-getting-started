"use strict";

var gulp = require("gulp");
var concat = require('gulp-concat');
var rimraf = require('rimraf');

var Config = require('./gulpfile.config');

var config = new Config();

gulp.task('concat-js', function () {
    return gulp.src(config.allJavaScript)
      .pipe(concat('app.js'))
      .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', ['concat-js'], function () {
    gulp.watch(config.allFiles, ['concat-js']);
});

gulp.task('libs', function () {
    return gulp.src(config.libs).pipe(gulp.dest(config.paths.lib));
});

gulp.task('clean', function (callback) {
    rimraf(config.paths.lib, callback);
});


gulp.task('default', ['concat-js', 'watch']);