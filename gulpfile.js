"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        },
        port: 3000
    });
    done();
}

// BrowserSync reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// // Clean vendor
// function clean() {
//     return del(["./vendor/"]);
// }

// Bring third party dependencies from node_modules into vendor directory
function modules() {
    // Bootstrap JS
    var bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js')
        .pipe(gulp.dest('./dist/js/bootstrap'));
    // Font Awesome CSS
    var fontAwesomeCSS = gulp.src('./node_modules/@fortawesome/fontawesome-free/css/all.min.css')
        .pipe(gulp.dest('./dist/css/fontawesome-free/css'));

        // magnigic pop up css
        var magnific = gulp.src('node_modules/magnific-popup/dist/magnific-popup.css')
            .pipe(gulp.dest('./dist/css'));
    // Font Awesome Webfonts
    var fontAwesomeWebfonts = gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
        .pipe(gulp.dest('./dist/css/fontawesome-free/webfonts'));
    // jQuery Easing
    var jqueryEasing = gulp.src('./node_modules/jquery.easing/jquery.easing.min.js')
        .pipe(gulp.dest('./dist/js'));
    // jQuery
    var jquery = gulp.src([
      './node_modules/jquery/dist/jquery.min.js',
      '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulp.dest('./dist/js'));

    return merge(bootstrapJS, fontAwesomeCSS, fontAwesomeWebfonts, jquery, jqueryEasing, magnific);
}

// CSS task
function css() {
    return gulp
        .src("./scss/**/*.scss")
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest("./dist/css"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest("./dist/css"))
        .pipe(browsersync.stream());
}

// JS task
function js() {
    return gulp
        .src([
      './js/*.js',
      '!./js/*.min.js',
      'node_modules/magnific-popup/dist/jquery.magnific-popup.js'
    ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browsersync.stream());
}

// html task
function html() {
    return gulp
        .src('./*html')
    .pipe(gulp.dest('./dist'));
}

// Watch files
function watchFiles() {
    gulp.watch("./scss/**/*", css);
    gulp.watch(["./js/**/*", "!./js/**/*.min.js"], js);
    gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const dist = gulp.series(modules);
const build = gulp.series(dist, gulp.parallel(css, js, html));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
// exports.clean = clean;
exports.dist = dist;
exports.build = build;
exports.watch = watch;
exports.default = build;
