require.config({
    baseUrl: '../../compiled',
    paths: {
        main: 'examples/main',

        AppDispatcher: '../../src/compiled/dispatcher/AppDispatcher',
        RequestHandler: '../../src/compiled/examples/utils/RequestHandler',
        drc: '../../src/compiled',

        // Third Party
        d3: '../../bower_components/d3/d3',
        jquery: '../../bower_components/jquery/dist/jquery',
        lodash: '../../bower_components/lodash/lodash',
        moment: '../../bower_components/moment/moment',
        react: '../../bower_components/react/react-with-addons'
    }
});
