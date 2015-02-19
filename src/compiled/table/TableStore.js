define(function(require) {
    'use strict';

    var AppDispatcher = require('AppDispatcher');
    var _ = require('lodash');
    var Moment = require('moment');
    var StoreBase = require('drc/lib/StoreBase');
    var TableActions = require('drc/table/TableActions');

    var ActionTypes = TableActions.actionTypes;

    /**
     * A Table requires a definition to operate upon. The table definition requires a url for requesting
     * data and an array of cols (column definitions). An object in the cols array requires a headerLabel,
     * dataProperty, and a percentage width. The Table may also receive a sortColIndex which adds required
     * fields to the cols objects of sortDirection (ascending/descending) and dataType (string, number,
     * percent, time, or status). The table definition may also include a pagination object with two required
     * properties (cursor - the starting index and size - number of lines per page).
     * @param {String} id - The unique identifier of the Table instance.
     * @param {Object} definition - A defined table.
     * @param {Function} dataFormatter - A function that will allow for post processing of data from the server.
     * @constructor
     */
    var Table = function(id, definition, dataFormatter) {
        this.id = id;
        this.url = definition.url;
        this.cols = definition.cols;
        this.sortColIndex = definition.sortColIndex;
        this.pagination = definition.pagination;
        this.cursor = definition.cursor;
        this.rowClick = definition.rowClick;
        this.data = null;
        this.dataCount = null;
        this.dataFormatter = dataFormatter;
    };

    Table.prototype = {
        /**
         * Triggered when data is received correctly from the server.
         * @param {Object} data - The data retrieved from the server for the Table instance.
         */
        onDataReceived: function(data) {
            this.data = _.values(data);
            this.dataCount = data.length;

            // Run data through definition formatter if it exists.
            if (this.dataFormatter) {
                this.data = this.dataFormatter(data);
            }

            // Run data through built in data formatters.
            _.forEach(this.cols, function(col) {
                // Default to 15 minutes if the onlineLimit for the col was not set or was set incorrectly.
                if (col.dataType === 'status' && (typeof col.onlineLimit !== 'number' || col.onlineLimit < 1)) {
                    col.onlineLimit = 15;
                }
                _.forEach(data, function(item) {
                    if (col.dataType === 'percent') {
                        item[col.dataProperty] += '%';
                    }
                    else if (col.dataType === 'time' || col.dataType === 'status') {
                        if (col.dataType === 'status' && item[col.dataProperty]) {
                            item.online = Moment(item[col.dataProperty]).valueOf() > Moment(Date.now()).subtract(col.onlineLimit, 'minutes').valueOf();
                        }

                        // Need to keep track of the original timestamp for column sorting to work properly.
                        item.timestamp = item[col.dataProperty] ? item[col.dataProperty] : null;
                        item[col.dataProperty] = item[col.dataProperty] ? Moment(item[col.dataProperty]).format(col.timeFormat) : '--';
                    }
                });
            });

            if (typeof this.sortColIndex === 'number') {
                this.sortData(this.sortColIndex, this.cols[this.sortColIndex].sortDirection);
            }
        },

        /**
         * Triggered when data doesn't return correctly from the server.
         */
        errorFunction: function() {
            this.data = null;
        },

        /**
         * Retrieves the data for the table (also triggers pagination).
         * @returns {Array} - A potentially filtered and paginated subset of table data.
         */
        getData: function() {
            var data = _.clone(this.data);
            this.dataCount = data.length;

            if (this.filterValue) {
                data = this.filterData(data);
            }

            if (this.pagination) {
                return this.sliceData(data);
            }

            return data;
        },

        /**
         * Retrieves the number of data rows that need to be inserted into the table.
         * @returns {Number} - The number of table data elements.
         */
        getDataCount: function() {
            return this.dataCount;
        },

        /**
         * Retrieves the column definitions for the table.
         * @returns {Array} An array of objects that define table columns originally defined in the table definition.
         */
        getColDefinitions: function() {
            return this.cols;
        },

        /**
         * Retrieves the column index that the table is set to be sorting off of.
         * @returns {Number} - Table.sortColIndex originally defined in the table's definition.
         */
        getSortColIndex: function() {
            return this.sortColIndex;
        },

        /**
         * Retrieves a rowClick object for the Table.
         * @returns {Object} - Contains properties used in the row click handler of the table component.
         */
        getRowClickData: function() {
            return this.rowClick;
        },

        /**
         * Retrieves the pagination data for the table. This includes cursor and size.
         * @returns {{cursor: number, size: number}}
         */
        getPaginationData: function() {
            return this.pagination;
        },

        /**
         * Sets the value used for filtering the Table.
         * @param {String|Number} value - The string or number used to filter out table rows that are not a match.
         */
        setFilterValue: function(value) {
            this.filterValue = value;
        },

        /**
         * Filters out table data that does not match the filter value for table cols that have quickFilter set to true.
         * @param {Array} data - Cloned Table.data.
         * @returns {Array} - The subset of data that matches the filter value.
         */
        filterData: function(data) {
            var value = this.filterValue;
            var filteredData = [];
            var matches;

            _.forEach(this.cols, function(col) {
                if (col.quickFilter) {
                    matches = _.remove(data, function(item) {
                        if (typeof item[col.dataProperty] === 'string') {
                            return item[col.dataProperty].toLowerCase().indexOf(value.toString().toLowerCase()) !== -1;
                        }
                        else if (typeof item[col.dataProperty] === 'number') {
                            return item[col.dataProperty].toString().indexOf(value.toString()) !== -1;
                        }
                    });

                    filteredData = filteredData.concat(matches);
                }
            });

            this.dataCount = filteredData.length;

            return filteredData;
        },

        /**
         * Moves the cursor forwards or backwards through paginated data.
         * @param {String} direction - the direction paginate (right or left).
         */
        paginate: function(direction) {
            var size = this.pagination.size;
            this.pagination.cursor += direction === 'right' ? size : -1 * size;
        },

        /**
         * When sorting is triggered, a paginated table with reposition it's cursor to the beginning.
         */
        resetPagination: function() {
            this.pagination.cursor = 0;
        },

        /**
         * Returns a subset of data for pagination.
         * @param {Object} data - The data retrieved from the server for the Table instance after formatting has occurred.
         * @returns {Array} - A paginated subset of table data.
         */
        sliceData: function(data) {
            return data.slice(this.pagination.cursor, this.pagination.cursor + this.pagination.size);
        },

        /**
         * Sorts the array of data for the Table based on the sort column index and the direction.
         * @param {Number} colIndex - The index of the table column that is to sorted.
         * @param {String} direction - The direction to sort (ascending or descending).
         */
        sortData: function(colIndex, direction) {
            this.sortColIndex = colIndex;
            this.cols[colIndex].sortDirection = direction;

            var dataType = this.cols[this.sortColIndex].dataType;
            var key;

            if (dataType === 'time' || dataType === 'status') {
                key = 'timestamp';
            }
            else {
                key = this.cols[this.sortColIndex].dataProperty;
            }

            if (this.pagination) {
                this.resetPagination();
            }

            this.data.sort(function(a, b) {
                var first = a[key];
                var second = b[key];

                if (dataType === 'string') {
                    first = first.toLowerCase();
                    second = second.toLowerCase();
                }
                if (dataType === 'time' || dataType === 'status') {
                    first = first ? first : 0;
                    second = second ? second : 0;
                }
                if (first > second) {
                    return direction === 'ascending' ? 1 : -1;
                }
                if (first < second) {
                    return direction === 'ascending' ? -1 : 1;
                }
                // a must be equal to b
                return 0;
            }.bind(this));
        }
    };

    var TableStore = _.merge({
        // Holds all of the existing Tables.
        collection: {},
        // The components that are allowed to dispatch actions into this store.
        componentType: 'Table',

        /**
         * Creates an instance of Table.
         * @param {String} id - The unique identifier used to access the Table instance.
         * @param {String} definition - A defined Table.
         * @param {Function} dataFormatter - A function that will allow for post processing of data from the server.
         */
        createInstance: function(id, definition, dataFormatter) {
            this.collection[id] = new Table(id, definition, dataFormatter);
        },

        /**
         * Destroys an instance of Table.
         * @param {String} id - The unique identifier of the Table instance to be destroyed.
         */
        destroyInstance: function(id) {
            delete this.collection[id];
        },

        /**
         * Retrieves the data for the table (also triggers pagination).
         * @param {String} id - The unique identifier of the Table instance to request data for.
         * @returns {Array|Null} - Table.data or null if data hasn't been received from the server yet.
         */
        getData: function(id) {
            return this.collection[id].getData();
        },

        /**
         * Retrieves the number of data rows that need to be inserted into the table.
         * @param {String} id - The unique identifier of the Table instance to get a data count for.
         * @returns {Number} - The length of the Table.data array.
         */
        getDataCount: function(id) {
            return this.collection[id].getDataCount();
        },

        /**
         * Retrieves the column definitions for the table.
         * @param {String} id - The unique identifier of the Table instance to get the column definition for.
         * @returns {Array} - List of column objects containing key information to render the table.
         */
        getColDefinitions: function(id) {
            return this.collection[id].getColDefinitions();
        },

        /**
         * Retrieves the column index that the table is set to be sorting off of.
         * @param {String} id - The unique identifier of the Table instance to get the sorting column index for.
         * @returns {Number} - The Table.sortColIndex.
         */
        getSortColIndex: function(id) {
            return this.collection[id].getSortColIndex();
        },

        /**
         * Retrieves a value representing if table rows are clickable (for style and behavior).
         * @param {String} id - The unique identifier of the Table instance to get row click data for.
         * @returns {Object} - Contains properties used in the row click handler of the table component.
         */
        getRowClickData: function(id) {
            return this.collection[id].getRowClickData();
        },

        /**
         * Retrieves the pagination data for the table. This includes cursor and size.
         * @param {String} id - The unique identifier of the Table instance to request pagination data for.
         * @returns {{cursor: number, size:number}}
         */
        getPaginationData: function(id) {
            return this.collection[id].getPaginationData();
        },

        /**
         * Sets the value used for filtering a Table instance.
         * @param {String} id - The unique identifier of the Table instance to request filtering data for.
         * @param {String|Number} value - The string or number used to filter out table rows that are not a match.
         */
        setFilterValue: function(id, value) {
            this.collection[id].setFilterValue(value);
        },

        /**
         * Moves the cursor forwards or backwards through paginated data.
         * @param {String} id - The unique identifier of the Table instance to paginate.
         * @param {String} direction - the direction paginate (right or left).
         */
        paginate: function(id, direction) {
            this.collection[id].paginate(direction);
        },

        /**
         * Sorts the array of data for the Table based on the sort column index and the direction.
         * @param {String} id - The unique identifier of the Table instance to be sorted.
         * @param {Number} colIndex - The index of the table column that is to sorted.
         * @param {String} direction - The direction to sort (ascending or descending).
         */
        sortData: function(id, colIndex, direction) {
            this.collection[id].sortData(colIndex, direction);
        },

        /**
         * Handles all events sent from the dispatcher. Filters out to only those sent via the Table
         * @param {Object} payload - Contains action details.
         */
        dispatchRegister: function(payload) {
            var action = payload.action;

            if (!this.shouldHandleAction(action.component)) {
                return;
            }

            switch (action.actionType) {
                case ActionTypes.REQUEST_DATA:
                    this.handleRequestDataAction(action);
                    break;
                case ActionTypes.TABLE_SORT:
                    this.sortData(action.id, action.data.colIndex, action.data.direction);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.FILTER:
                    this.setFilterValue(action.id, action.data.value);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.PAGINATE:
                    this.paginate(action.id, action.data.direction);
                    this.emitChange(action.id);
                    break;
                case ActionTypes.DESTROY_INSTANCE:
                    this.destroyInstance(action.id);
                    break;
            }
        },

        Table: Table
    }, StoreBase);

    AppDispatcher.register(_.bind(TableStore.dispatchRegister, TableStore));

    return TableStore;
});
