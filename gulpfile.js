var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var minify = require('gulp-minify');

gulp.task('build', function() {
  gulp.src([
    'src/module.coffee',
    'src/config.coffee',
    'src/interceptor.coffee',
    'src/provider.coffee',
  ])
    .pipe(coffee({bare: true}))
    .pipe(concat('angular-trello-api-client.js'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('watch', ['build'], function () {
  gulp.watch('./src/*.coffee', ['build']);
});

gulp.task('release', ['build'], function() {
  gulp.src('dist/*.js')
    .pipe(minify({
        ignoreFiles: ['.min.js']
    }))
    .pipe(gulp.dest('dist'))
});
