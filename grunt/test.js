var port = '9001';
var connect = require('../node_modules/grunt-contrib-connect/tasks/connect');

module.exports = function(grunt, options) {
    return { tasks: {
        /**
         * Jasmine client side JS test tasks
         */
        jasmine: {
            src: ['app/compiled/**/*.js', '!app/compiled/third-party/*',
                '!app/compiled/main.js', '!app/compiled/**/tests/*.js'],
            options: {
                specs: ['app/compiled/**/*.test.js'],
                helpers: [
                    'app/compiled/tests/bind-polyfill.js',
                    'app/compiled/tests/mock-ajax.js',
                    //Expanded Jasmine assertions - https://github.com/JamieMason/Jasmine-Matchers
                    'bower_components/jasmine-expect/dist/jasmine-matchers.js'
                ],
                template: require('grunt-template-jasmine-istanbul'),
                templateOptions: {
                    coverage: 'bin/coverage/app/coverage.json',
                    report: 'bin/coverage/app',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: 'app/require.config.js',
                        requireConfig: {
                            baseUrl: 'app/compiled/',
                            paths: {
                                'jquery': '../../../bower_components/jquery/dist/jquery',
                                'lodash': '../../../bower_components/lodash/dist/lodash',
                                'react': '../../../bower_components/react/react-with-addons',
                                'third-party': '../../../app/compiled/third-party',
                                'testUtil': '../../../app/compiled/tests/util'
                            },
                            callback: function () {
                                define('instrumented', ['module'], function (module) {
                                    return module.config().src;
                                });
                                require(['instrumented'], function () {
                                    var oldLoad = requirejs.load;
                                    requirejs.load = function (context, moduleName, url) {
                                        // normalize paths
                                        // changes app/compiled/../../../bower_components/* to bower_components/*
                                        if (url.indexOf('app/compiled/../../../') === 0) {
                                            url = url.substring(22);
                                        }
                                        // changes app/compiled/../../.grunt/grunt-contrib-jasmine/app/compiled/* to grunt/grunt-contrib-jasmine/app/compiled/*
                                        else if (url.indexOf('app/compiled/../../.') === 0) {
                                            url = url.substring(19);
                                        }
                                        // changes app/compiled/* to .grunt/grunt-contrib-jasmine/app/compiled/* without altering test files
                                        else if (url.indexOf('app/compiled/') === 0 && url.indexOf('test') === -1) {
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
                'app/**/*.js',
                '!app/js/**/*.js', //We scan the /compiled versions, not the source since JSX hoses things
                '!app/compiled/third-party/*.js',
                '!app/compiled/tests/*.js',
                '!app/**/*.test.js'
            ]
        },

        /**
         * Javascript Style Checker config
         */
        jscs: {
            src: [
                'app/**/*.js',
                '!app/js/**/*.js', //We scan the /compiled versions, not the source since JSX hoses things
                '!app/compiled/third-party/*.js',
                '!app/compiled/tests/*.js',
                '!app/**/*.test.js'
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
