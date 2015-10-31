var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('scripts', function() {
	return browserify({
		entries: './source/main.js',
		debug: true
	})
	.bundle()
	.pipe(source('main.js'))
	.pipe(buffer())
	.pipe(gulp.dest('dist/source/'));
});

gulp.task('styles', function() {
	return gulp.src('scss/*.scss')
		.pipe(sass())
		.pipe(autoprefixer('last 2 versions'))
		.pipe(gulp.dest('dist/css/'));
});

gulp.task('watch', function() {
	gulp.watch("source/**/*.js", ['scripts']);
	gulp.watch("scss/**/*.scss", ['styles']);
});

gulp.task('default', ['scripts', 'styles', 'watch']);