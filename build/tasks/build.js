// var fs = require('fs');
var gulp = require('gulp');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var to5 = require('gulp-babel');
var paths = require('../paths');
var compilerOptions = require('../babel-options');
var assign = Object.assign || require('object.assign');
var notify = require('gulp-notify');


// transpiles changed es6 files to CommonJS format
// the plumber() call prevents 'pipe breaking' caused
// by errors from other gulp plugins
// https://www.npmjs.com/package/gulp-plumber
gulp.task('build-system', function() {
  return gulp.src(paths.source)
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changed(paths.output, {extension: '.js'}))
    .pipe(to5(assign({}, compilerOptions.commonjs())))
    .pipe(gulp.dest(paths.output));
});

//puts the transpiled index.js in the package root
gulp.task('index-js', function() {
  return gulp.src('./dist/index.js')
    .pipe(rename('index.js'))
    .pipe(gulp.dest('.'));
});


gulp.task('build', function(callback) {
  return runSequence(
    'build-system',
    ['index-js'],
    callback
  );
});
