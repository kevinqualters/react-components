var port = '9001';
var connect = require('../node_modules/grunt-contrib-connect/tasks/connect');

module.exports = function(grunt, options) {
    return { tasks: {
        /**
         * Jasmine client side JS test tasks
         */
        jasmine: {
            src: ['src/compiled/**/*.js', '!src/compiled/third-party/*',
                '!src/compiled/examples/main.js', '!src/compiled/**/tests/*.js'],
            options: {
                specs: ['src/compiled/**/*.test.js'],
                helpers: [
                    'src/compiled/tests/bind-polyfill.js',
                    'src/compiled/tests/mock-ajax.js',
                    //Expanded Jasmine assertions - https://github.com/JamieMason/Jasmine-Matchers
                    'bower_components/jasmine-expect/dist/jasmine-matchers.js'
                ],
                template: require('grunt-template-jasmine-istanbul'),
                templateOptions: {
                    coverage: 'bin/coverage/src/coverage.json',
                    report: 'bin/coverage/src',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: 'src/require.config.js',
                        requireConfig: {
                            baseUrl: 'src/compiled/',
                            paths: {
                                'jquery': '../../../bower_components/jquery/dist/jquery',
                                'lodash': '../../../bower_components/lodash/dist/lodash',
                                moment: '../../../bower_components/moment/moment',
                                'react': '../../../bower_components/react/react-with-addons',
                                'third-party': '../../../src/compiled/third-party',
                                'testUtil': '../../../src/compiled/tests/util'
                            },
                            callback: function () {
                                define('instrumented', ['module'], function (module) {
                                    return module.config().src;
                                });
                                require(['instrumented'], function () {
                                    var oldLoad = requirejs.load;
                                    requirejs.load = function (context, moduleName, url) {
                                        // normalize paths
                                        // changes src/compiled/../../../bower_components/* to bower_components/*
                                        if (url.indexOf('src/compiled/../../../') === 0) {
                                            url = url.substring(22);
                                        }
                                        // changes src/compiled/../../.grunt/grunt-contrib-jasmine/src/compiled/* to grunt/grunt-contrib-jasmine/src/compiled/*
                                        else if (url.indexOf('src/compiled/../../.') === 0) {
                                            url = url.substring(19);
                                        }
                                        // changes src/compiled/* to .grunt/grunt-contrib-jasmine/src/compiled/* without altering test files
                                        else if (url.indexOf('src/compiled/') === 0 && url.indexOf('test') === -1) {
                                            url = '.grunt/grunt-contrib-jasmine/' + url;
                                        }
                                        return oldLoad.apply(this, [context, moduleName, url]);
                                    };
                                });
                            }
                        }
                    }
                }
            }
        },

        /**
         * JSHint configuration
         */
        jshint:{
            options:{
                newcap: false
            },
            src: [
                'src/**/*.js',
                '!src/js/**/*.js', //We scan the /compiled versions, not the source since JSX hoses things
                '!src/compiled/third-party/*.js',
                '!src/compiled/tests/*.js',
                '!src/**/*.test.js'
            ]
        },

        /**
         * Javascript Style Checker config
         */
        jscs: {
            src: [
                'src/**/*.js',
                '!src/js/**/*.js', //We scan the /compiled versions, not the source since JSX hoses things
                '!src/compiled/third-party/*.js',
                '!src/compiled/tests/*.js',
                '!src/**/*.test.js'
            ],
            options: {
                // http://jscs.info/rules.html
                disallowEmptyBlocks: true,
                disallowMixedSpacesAndTabs: true,
                disallowMultipleLineBreaks: true,
                disallowMultipleLineStrings: true,
                disallowPaddingNewlinesInBlocks: true,
                disallowSpaceAfterObjectKeys: true,
                disallowSpaceAfterPrefixUnaryOperators: true,
                disallowSpaceBeforePostfixUnaryOperators: true,
                disallowSpacesInCallExpression: true,
                requireBlocksOnNewline: 1,
                requireCamelCaseOrUpperCaseIdentifiers: true,
                requireCommaBeforeLineBreak: true,
                requireDotNotation: true,
                requireKeywordsOnNewLine: ["elseif", "else"],
                requireSpaceBeforeBinaryOperators: true,
                requireSpaceAfterBinaryOperators: true,
                requireSpaceBetweenArguments: true,
                requireSpacesInConditionalExpression: true,
                validateIndentation: 4,
                validateParameterSeparator: ", "
            }
        },

        /**
         * Static web server. Used to server code coverage result files
         */
        connect: {
            all: {
                options: {
                    port: port,
                    hostname: "0.0.0.0",
                    keepalive: true
                }
            }
        },

        /**
         * Opens users browser to a specific URL
         * @type {Object}
         */
        open: {
            all: {
                // Gets the port from the connect configuration
                path: 'http://localhost:<%= connect.all.options.port%>/bin/'
            }
        }
    }};
};
