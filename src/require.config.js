require.config({
    baseUrl: '../../compiled',
    paths: {
        main: 'examples/main',

        AppDispatcher: '../../src/compiled/examples/dispatcher/AppDispatcher',
        RequestHandler: '../../src/compiled/utils/RequestHandler',

        DataMixins: '../../src/compiled/mixins/DataMixins',
        GroupedActionsTable: '../../src/compiled/table/GroupedActionsTable',
        Table: '../../src/compiled/table/Table',
        TableActions: '../../src/compiled/table/TableActions',
        TableStore: '../../src/compiled/table/TableStore',
        Search: '../../src/compiled/search/Search',
        SearchActions: '../../src/compiled/search/SearchActions',
        SearchStore: '../../src/compiled/search/SearchStore',
        StoreBase: '../../src/compiled/lib/StoreBase',
        Utils: '../../src/compiled/utils/utils',

        // Third Party
        jquery: '../../bower_components/jquery/dist/jquery',
        lodash: '../../bower_components/lodash/dist/lodash',
        moment: '../../bower_components/moment/moment',
        react: '../../bower_components/react/react-with-addons'
    }
});
