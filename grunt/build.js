'use strict';

module.exports = function(grunt, options) {
    return {
        tasks: {
            uglify: {
                options: {
                    mangle: false
                },
                min: {
                    files: grunt.file.expandMapping(['src/compiled/**/*.js',
                                                     '!src/compiled/**/*.test.js',
                                                     '!src/compiled/third-party/**/*.js',
                                                     '!src/compiled/tests/**/*.js',
                                                     '!src/compiled/examples/**/*.js',
                                                     '!src/compiled/dispatcher/**/*.js'], './', {
                        rename: function (destBase, destPath) {
                            return destBase + destPath.replace('.js', '.min.js');
                        }
                    })
                }
            }
        }
    }
};
