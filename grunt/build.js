'use strict';

//On OSX sed -i requires a different argument signature
var sedOptions = '-i';
if (process.platform === 'darwin') {
    sedOptions += " ''";
}

var buildCommands = function() {
    return [
        './init.sh',
        'grunt test',
        'grunt compass',
        'chmod 777 dist',
        'grunt uglify:min'
    ];
};

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
            },
            /**
             * Shell command for building the minified files
             */
            shell:{
                build: {
                    command: [
                        buildCommands().join('&&')
                    ],
                    options: {
                        async: false
                    }
                },
                options: {
                    execOptions: {
                        detached: true
                    }
                }
            }
        }
    }
};
