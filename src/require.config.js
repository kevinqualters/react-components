require.config({
    baseUrl: '../../compiled',
    paths: {
        main: 'examples/main',

        AppDispatcher: '../../src/compiled/examples/dispatcher/AppDispatcher',
        RequestHandler: '../../src/compiled/utils/RequestHandler',

        DataMixins: '../../src/compiled/mixins/DataMixins',
        Table: '../../src/compiled/table/Table',
        GroupedActionsTable: '../../src/compiled/table/GroupedActionsTable',
        TableActions: '../../src/compiled/table/TableActions',
        TableStore: '../../src/compiled/table/TableStore',
        StoreBase: '../../src/compiled/lib/StoreBase',
        Utils: '../../src/compiled/utils/utils',

        // Third Party
        jquery: '../../bower_components/jquery/dist/jquery',
        lodash: '../../bower_components/lodash/dist/lodash',
        moment: '../../bower_components/moment/moment',
        react: '../../bower_components/react/react-with-addons'
    }
});
