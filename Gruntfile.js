'use strict';

module.exports = function(grunt) {

    var configs = require('load-grunt-configs')(grunt, {
        config : {
            src: "grunt/*.js"
        }
    });

    grunt.initConfig(configs);

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-shell-spawn');

    /**
     * Default task to be used by developers. Kill any existing processes, compile JSX/SASS
     */
    grunt.registerTask('default', [
        'shell:cleanCompiledDirectory',
        'shell:compassWatcher',
        'shell:jsxWatcher'
    ]);

    /**
     * Same as default but also runs init to populate NPM/Bower
     */
    grunt.registerTask('init', [
        'shell:init',
        'default'
    ]);

    /**
     * Runs all tests
     */
    grunt.registerTask('test',[
        'shell:cleanCompiledDirectory',
        'shell:jsxCompile',
        'jshint',
        'jscs',
        'jasmine'
    ]);

    /**
     * Runs tests and opens users browser to coverage report
     */
    grunt.registerTask('test:cov', [
        'test',
        'open',
        'connect'
    ]);

    /**
     * Creates minified files of all necessary source files if and only if testing passes
     */
    grunt.registerTask('build', [
        'test',
        'compass',
        'shell:build'
    ]);
};
