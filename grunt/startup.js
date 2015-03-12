'use strict';

module.exports.tasks = {
    compass: {
        dist: {
            options: {
                cssDir: 'dist',
                sassDir: 'src/sass',
                environment: 'production'
            }
        },
        dev: {
            options: {
                cssDir: 'src/js/examples/css',
                sassDir: 'src/js/examples/sass',
                environment: 'production'
            }
        }
    },

    watch: {
        scripts: {
            files: ['src/**/*.scss'],
            tasks: ['compass:dist', 'compass:dev']
        }
    },

    shell: {
        build: {
            command: 'grunt uglify:min',
            options: {
                async: false
            }
        },
        cleanCompiledDirectory: {
            command: 'rm -rf src/compiled',
            options: {
                async: true
            }
        },
        compassWatcher: {
            command: 'grunt compass && grunt watch',
            options: {
                async: true
            }
        },
        init: {
            command: './init.sh',
            options: {
                async: false
            }
        },
        jsxCompile: {
            command: 'jsx src/js/ src/compiled/',
            options: {
                async: false
            }
        },
        jsxWatcher: {
            command: 'jsx --watch src/js/ src/compiled/',
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
};
