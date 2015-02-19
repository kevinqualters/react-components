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
         * Action for populating table data. Used both for initial and subsequent loads.
         * @param {String} id - Unique identifier for the Table component.
         * @param {Object} definition - A configuration object for the Table.
         * @param {Function} dataFormatter - A function that will allow for post processing of data from the server.
         * @param {Object} filters - The query string params to be sent with any data requests to the server.
         */
        requestData: function(id, definition, dataFormatter, filters) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.REQUEST_DATA,
                component: 'Table',
                id: id,
                data: {
                    definition: definition,
                    dataFormatter: dataFormatter,
                    filters: filters
                }
            });
        },

        /**
         * Destroys an instance of Table.
         * @param {String} id - The unique identifier of the Table instance to be destroyed.
         */
        destroyInstance: function(id) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.DESTROY_INSTANCE,
                component: 'Table',
                id: id
            });
        },

        /**
         * Filters out table data that does not match the filter value for table cols that have quickFilter set to true.
         * @param {String} id - The unique identifier of the Table instance to request filtering data for.
         * @param {String|Number} value - The string or number used to filter out table rows that are not a match.
         */
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

        /**
         * Moves the cursor forwards or backwards through paginated data.
         * @param {String} id - The unique identifier of the Table instance to paginate.
         * @param {String} direction - the direction paginate (right or left).
         */
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

        /**
         * Sorts the array of data for the Table based on the sort column index and the direction.
         * @param {String} id - The unique identifier of the Table instance to be sorted.
         * @param {Number} colIndex - The index of the table column that is to sorted.
         * @param {String} direction - The direction to sort (ascending or descending).
         */
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
