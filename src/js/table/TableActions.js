define(function(require) {
    'use strict';

    var AppDispatcher = require('AppDispatcher');

    return {
        actionTypes: {
            REQUEST_DATA: 'REQUEST_DATA',
            DESTROY_INSTANCE: 'DESTROY_INSTANCE',
            FILTER: 'FILTER',
            PAGINATE: 'PAGINATE',
            TABLE_SORT: 'TABLE_SORT'
        },

        /**
         * Action for populating table data. Used both for initial and subsequent loads
         * @param {string} id - unique identifier for the component
         * @param {object} definition - A configuration object for the Table.
         * @param {object} filters
         */
        requestData: function(id, definition, filters) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.REQUEST_DATA,
                component: 'Table',
                id: id,
                data: {
                    definition: definition,
                    filters: filters
                }
            });
        },

        destroyInstance: function(id) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.DESTROY_INSTANCE,
                component: 'Table',
                id: id
            });
        },

        filter: function(id, value) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.FILTER,
                component: 'Table',
                id: id,
                data: {
                    value: value
                }
            });
        },

        paginate: function(id, direction) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.PAGINATE,
                component: 'Table',
                id: id,
                data: {
                    direction: direction
                }
            });
        },

        sortChange: function(id, colIndex, direction) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.TABLE_SORT,
                component: 'Table',
                id: id,
                data: {
                    colIndex: colIndex,
                    direction: direction
                }
            });
        }
    };
});
