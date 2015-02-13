define(function(require) {
    'use strict';

    var AppDispatcher = require('AppDispatcher');
    var _ = require('lodash');
    var StoreBase = require('drc/lib/StoreBase');
    var TableActions = require('drc/table/TableActions');

    var ActionTypes = TableActions.actionTypes;

    /**
     * A Table requires a definition to operate upon. The table definition requires a url for requesting
     * data and an array of cols (column definitions). an object in the cols array requires a headerLabel,
     * dataProperty, and a percentage width. The Table may also receive a sortColIndex which adds required
     * fields to the cols objects of sortDirection (ascending/descending) and dataType (string, number,
     * percent, or time). The table definition may also include a pagination object with two required
     * properties (cursor - the starting index and size - number of lines per page).
     * @param {string} id - The unique identifier of the Tab instance.
     * @param {object} definition - A defined table.
     * @constructor
     */
    var Table = function(id, definition) {
        this.id = id;
        this.url = definition.url;
        this.cols = definition.cols;
        this.sortColIndex = definition.sortColIndex;
        this.pagination = definition.pagination;
        this.cursor = definition.cursor;
        this.rowClick = definition.rowClick;
        this.dataFormatter = definition.dataFormatter || undefined;
        this.data = null;
        this.dataCount = null;
    };

    Table.prototype = {
        /**
         * Triggered when data is received correctly from the server.
         * @param {object} data - The data retrieved from the server for the Table instance.
         */
        onDataReceived: function(data) {
            this.data = _.values(data);
            this.dataCount = data.length;
            //Run data through definition formatter if it exists
            if(this.dataFormatter){
                this.data = this.dataFormatter(data);
            }
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
         * @returns {array} - A paginated subset of Table.data or just Table.data.
         */
        getData: function() {
            var data = _.clone(this.data);
            this.dataCount = data.length;

            if (this.filterValue) {
                data = this.filterData(data, this.filterValue);
            }

            if (this.pagination) {
                return this.sliceData(data, this.pagination);
            }

            return data;
        },

        /**
         * Retrieves the number of data rows that need to be inserted into the table.
         * @returns {number} - The length of the Table.data array.
         */
        getDataCount: function() {
            return this.dataCount;
        },

        /**
         * Retrieves the column definitions for the table.
         * @returns {array} An array of objects Table.cols originally defined in the table's definition.
         */
        getColDefinitions: function() {
            return this.cols;
        },

        /**
         * Retrieves the column index that the table is set to be sorting off of.
         * @returns {number} - Table.sortColIndex originally defined in the table's definition.
         */
        getSortColIndex: function() {
            return this.sortColIndex;
        },

        /**
         * Retrieves an actionType and callback function to use for table row clicks.
         * @returns {object} - Contains properties used in the row click handler of the table component.
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

        setFilterValue: function(value) {
            this.filterValue = value;
        },

        filterData: function(data, value) {
            var filteredData = [];
            var matches;

            _.forEach(this.cols, function(col) {
                if (col.quickFilter) {
                    matches = _.filter(data, function(item) {
                        if (col.dataType === 'string') {
                            return item[col.dataProperty].toLowerCase().indexOf(value.toLowerCase()) !== -1;
                        }
                        else if (col.dataType === 'number') {
                            return item[col.dataProperty] === (Number(value));
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
         * @param {string} direction - the direction paginate (right or left).
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
         * @param {object} data - The data retrieved from the server for the Table instance.
         * @param {object} pagination - The Table's pagination object containing cursor and size.
         * @returns {array} - A paginated slice of Table.data.
         */
        sliceData: function(data, pagination) {
            return data.slice(pagination.cursor, pagination.cursor + pagination.size);
        },

        /**
         * Sorts the array of data for the Table based on the sort column index and the direction.
         * @param {number} colIndex - The index of the table column that is to sorted.
         * @param {string} direction - The direction to sort (ascending or descending).
         */
        sortData: function(colIndex, direction) {
            this.sortColIndex = colIndex;
            this.cols[colIndex].sortDirection = direction;

            var dataType = this.cols[this.sortColIndex].dataType;
            var key = this.cols[this.sortColIndex].dataProperty;

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
                if (dataType === 'time') {
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
         * @param {string} id - The unique identifier used to access the Table instance.
         * @param {string} definition - A defined Table.
         */
        createInstance: function(id, definition) {
            this.collection[id] = new Table(id, definition);
        },

        /**
         * Destroys an instance of Table.
         * @param {string} id - The unique identifier of the Table instance to be deleted.
         */
        destroyInstance: function(id) {
            delete this.collection[id];
        },

        /**
         * Retrieves the data for the table (also triggers pagination).
         * @param {string} id - The unique identifier of the Table instance to request data for.
         * @returns {array|null} - Table.data or null if data hasn't been received from the server yet.
         */
        getData: function(id) {
            return this.collection[id].getData();
        },

        /**
         * Retrieves the number of data rows that need to be inserted into the table.
         * @param {string} id - The unique identifier of the Table instance to get a data count for.
         * @returns {number} - The length of the Table.data array.
         */
        getDataCount: function(id) {
            return this.collection[id].getDataCount();
        },

        /**
         * Retrieves the column definitions for the table.
         * @param {string} id - The unique identifier of the Table instance to get the column definition for.
         * @returns {array} - List of column objects containing key information to render the table.
         */
        getColDefinitions: function(id) {
            return this.collection[id].getColDefinitions();
        },

        /**
         * Retrieves the column index that the table is set to be sorting off of.
         * @param {string} id - The unique identifier of the Table instance to get the sorting column index for.
         * @returns {number} - The Table.sortColIndex.
         */
        getSortColIndex: function(id) {
            return this.collection[id].getSortColIndex();
        },

        /**
         * Retrieves a value representing if table rows are clickable (for style and behavior).
         * @param {string} id - The unique identifier of the Table instance to get row click data for.
         * @returns {object} - Contains properties used in the row click handler of the table component.
         */
        getRowClickData: function(id) {
            return this.collection[id].getRowClickData();
        },

        /**
         * Retrieves the pagination data for the table. This includes cursor and size.
         * @param {string} id - The unique identifier of the Table instance to request pagination data for.
         * @returns {{cursor: number, size:number}}
         */
        getPaginationData: function(id) {
            return this.collection[id].getPaginationData();
        },

        setFilterValue: function(id, value) {
            this.collection[id].setFilterValue(value);
        },

        /**
         * Moves the cursor forwards or backwards through paginated data.
         * @param {string} id - The unique identifier of the Table instance to paginate.
         * @param {string} direction - the direction paginate (right or left).
         */
        paginate: function(id, direction) {
            this.collection[id].paginate(direction);
        },

        /**
         * Sorts the array of data for the Table based on the sort column index and the direction.
         * @param {string} id - The unique identifier of the Table instance to be sorted.
         * @param {number} colIndex - The index of the table column that is to sorted.
         * @param {string} direction - The direction to sort (ascending or descending).
         */
        sortData: function(id, colIndex, direction) {
            this.collection[id].sortData(colIndex, direction);
        },

        /**
         * Handles all events sent from the dispatcher. Filters out to only those sent via the Table
         * @param {object} payload - Contains action details.
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
